<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\DataCollector\GraphQLCollector;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Repository\FollowerRepository;

class ProposalViewerFollowingConfigurationDataLoader extends BatchDataLoader
{
    private $followerRepository;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        FollowerRepository $followerRepository,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->followerRepository = $followerRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $collector,
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
