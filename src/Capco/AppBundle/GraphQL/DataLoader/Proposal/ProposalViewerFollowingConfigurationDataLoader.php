<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\UserBundle\Entity\User;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalViewerFollowingConfigurationDataLoader extends BatchDataLoader
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

    public function all(array $keys)
    {
        $user = $keys[0]['viewer'];
        $batchProposalIds = array_map(fn ($key) => $key['proposal']->getId(), $keys);

        $followers = $this->followerRepository->getByProposalIdsAndUser($batchProposalIds, $user);
        $results = array_map(function ($key) use ($followers) {
            $found = array_values(
                array_filter($followers, fn ($follower) => $follower->getProposal()->getId() === $key['proposal']->getId())
            );

            return isset($found[0]) ? $found[0]->getNotifiedOf() : null;
        }, $keys);

        return $this->getPromiseAdapter()->createAll($results);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'viewerId' => $key['viewer']->getId(),
        ];
    }

    private function resolve(Proposal $proposal, User $viewer): ?string
    {
        $follower = $this->followerRepository->findOneBy([
            'proposal' => $proposal,
            'user' => $viewer,
        ]);

        if ($follower) {
            return $follower->getNotifiedOf();
        }

        return null;
    }
}
