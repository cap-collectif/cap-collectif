<?php

namespace Capco\AppBundle\GraphQL\DataLoader\User;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Resolver\ProposalStepVotesResolver;
use Capco\UserBundle\Entity\User;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class ViewerProposalVotesDataLoader extends BatchDataLoader
{
    public $enableBatch = true;
    public $useElasticsearch = true;
    private $abstractStepRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $globalIdResolver;
    private $helper;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        AbstractStepRepository $repository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalStepVotesResolver $helper,
        GlobalIdResolver $globalIdResolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        bool $enableCache
    ) {
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->helper = $helper;

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

    public function invalidate(User $user): void
    {
        $this->cache->invalidateTags([$user->getId()]);
    }

    public function all(array $keys)
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

        $connections = [];
        foreach ($keys as $key) {
            $connections[] = $this->resolve($key['user'], $key['args']);
        }

        return $this->getPromiseAdapter()->createAll($connections);
    }

    public function getConnectionForStepAndUser(
        AbstractStep $step,
        User $user,
        Argument $args
    ): Connection {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];

        if ($step instanceof CollectStep) {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                $step,
                $field,
                $direction
            ) {
                return $this->proposalCollectVoteRepository
                    ->getByAuthorAndStep($user, $step, $limit, $offset, $field, $direction)
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->proposalCollectVoteRepository->countByAuthorAndStep($user, $step);
        } elseif ($step instanceof SelectionStep) {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $user,
                $step,
                $field,
                $direction
            ) {
                return $this->proposalSelectionVoteRepository
                    ->getByAuthorAndStep($user, $step, $limit, $offset, $field, $direction)
                    ->getIterator()
                    ->getArrayCopy();
            });
            $totalCount = $this->proposalSelectionVoteRepository->countByAuthorAndStep(
                $user,
                $step
            );
        } else {
            throw new \RuntimeException('Unknown step type.');
        }
        $connection = $paginator->auto($args, $totalCount);

        $creditsSpent = $this->helper->getSpentCreditsForUser($user, $step);
        $connection->{'creditsSpent'} = $creditsSpent;
        $connection->{'creditsLeft'} = $step->getBudget() - $creditsSpent;

        return $connection;
    }

    protected function normalizeValue($value)
    {
        // TODO we can do better here
        return $value;
    }

    protected function denormalizeValue($value)
    {
        // TODO we can do better here
        return $value;
    }

    protected function getCacheTag($key): array
    {
        return [$key['user']->getId()];
    }

    protected function serializeKey($key)
    {
        return [
            'userId' => $key['user']->getId(),
            'args' => $key['args'],
        ];
    }

    private function resolve(User $user, Argument $args): Connection
    {
        try {
            $step = $this->globalIdResolver->resolve($args->offsetGet('stepId'), $user);

            if (!$step) {
                $connection = ConnectionBuilder::connectionFromArray([], $args);
                $connection->totalCount = 0;

                return $connection;
            }

            return $this->getConnectionForStepAndUser($step, $user, $args);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
