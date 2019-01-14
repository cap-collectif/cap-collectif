<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Selection;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class ProposalStatusDataLoader extends BatchDataLoader
{
    private $globalIdResolver;
    private $tokenStorage;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisCache $cache,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        TokenStorageInterface $tokenStorage,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->tokenStorage = $tokenStorage;
        parent::__construct(
            [$this, 'all'],
            $promiseFactory,
            $logger,
            $cache,
            $cachePrefix,
            $cacheTtl,
            $debug,
            $enableCache
        );
    }

    public function invalidate(Proposal $proposal): void
    {
        // TODO
        $this->invalidateAll();
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

        $batch = false;

        if ($batch) {
            $statuses = $this->resolveBatch($keys);
        } else {
            $statuses = $this->resolveWithoutBatch($keys);
        }

        return $this->getPromiseAdapter()->createAll($statuses);
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
            'args' => $key['args']->getRawArguments(),
        ];
    }

    private function resolveBatch(array $keys): array
    {
        // TODO
        return [];
    }

    private function resolveWithoutBatch(array $keys): array
    {
        $statuses = [];
        foreach ($keys as $key) {
            $statuses[] = $this->resolve($key['proposal'], $key['args']);
        }

        return $statuses;
    }

    private function resolve(Proposal $proposal, Argument $args): ?Status
    {
        if ($args->offsetExists('step') && $args->offsetGet('step')) {
            $stepId = $args->offsetGet('step');
            $step = $this->globalIdResolver->resolve(
                $stepId,
                $this->tokenStorage->getToken()->getUser()
            );

            if ($step instanceof CollectStep) {
                return $proposal->getStatus();
            }

            if ($step instanceof SelectionStep) {
                /** @var Selection $selection */
                foreach ($proposal->getSelections() as $selection) {
                    if ($selection->getStep()->getId() === $stepId) {
                        return $selection->getStatus();
                    }
                }
            }

            throw new UserError('Unknown step');
        }

        return $proposal->getStatus();
    }
}
