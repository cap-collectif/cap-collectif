<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalAuthorDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        private readonly UserRepository $userRepository,
        RedisTagCache $cache,
        LoggerInterface $logger,
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
        $this->invalidateAll();
    }

    public function all(array $keys)
    {
        $ids = array_map(function ($key) {
            return $key['proposal']->getId();
        }, $keys);

        $authors = array_map(function ($key) {
            return $this->resolve($key['proposal']);
        }, $keys);

        // TO fix tests, disable batching
        // TODO restore this
        //
        // $results = $this->userRepository->getUserFromProposalIds($ids);
        // foreach ($results as $key => $result) {
        //     $results[$result['id']] = (new User())->hydrate($result['user']);
        //     unset($results[$key]);
        // }
        // $ids = array_flip($ids);
        // $results = array_merge($ids, $results);

        // $authors = [];
        // foreach ($results as $key => $result) {
        //     $authors[] = $result;
        // }

        return $this->getPromiseAdapter()->createAll($authors);
    }

    protected function serializeKey($key)
    {
        return [
            'proposalId' => $key['proposal']->getId(),
        ];
    }

    private function resolve(Proposal $proposal): User
    {
        return $proposal->getAuthor();
    }
}
