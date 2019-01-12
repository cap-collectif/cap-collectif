<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Cache\RedisTagCache;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\Entity\Status;

class ProposalStatusDataLoader extends BatchDataLoader
{
    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
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
        if ($args->offsetExists('step')) {
            $stepId = $args->offsetGet('step');
            /** @var Selection $selection */
            foreach ($proposal->getSelections() as $selection) {
                if ($selection->getStep()->getId() === $stepId) {
                    return $selection->getStatus();
                }
            }
        }

        return $proposal->getStatus();
    }
}
