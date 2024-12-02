<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\FollowerRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalViewerIsFollowingDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        private readonly FollowerRepository $followerRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        parent::__construct(
            $this->all(...),
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
            $stopwatch,
            $enableCache
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        $this->cache->invalidateTags([$proposal->getId()]);
    }

    public function all(array $keys): Promise
    {
        if ($this->debug) {
            $this->logger->info(
                __METHOD__ .
                    'called for keys : ' .
                    var_export(
                        array_map(function ($key) {
                            return $this->serializeKey($key);
                        }, $keys),
                        true
                    )
            );
        }

        $user = $keys[0]['viewer'];
        $batchProposalIds = array_map(function ($key) {
            return $key['proposal']->getId();
        }, $keys);

        $followers = $this->followerRepository->getByProposalIdsAndUser($batchProposalIds, $user);
        $results = array_map(function ($key) use ($followers) {
            $found = array_values(
                array_filter($followers, function ($follower) use ($key) {
                    return $follower->getProposal()->getId() === $key['proposal']->getId();
                })
            );

            return isset($found[0]);
        }, $keys);

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function getCacheTag($key): array
    {
        return [$key['proposal']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'viewerId' => $key['viewer']->getId(),
        ];
    }
}
