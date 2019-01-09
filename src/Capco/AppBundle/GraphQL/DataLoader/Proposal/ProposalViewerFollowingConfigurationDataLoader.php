<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

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
        bool $debug
    ) {
        $this->followerRepository = $followerRepository;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        $this->cache->invalidateTags([$proposal->getId()]);
    }

    public function all(array $keys)
    {
        $connections = [];

        // TODO add some batching here
        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['proposal'], $key['viewer']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
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
