<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Entity\Selection;
use Symfony\Component\Stopwatch\Stopwatch;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;

class ProposalStatusDataLoader extends BatchDataLoader
{
    private $globalIdResolver;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisCache $cache,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        $this->globalIdResolver = $globalIdResolver;
        parent::__construct(
            [$this, 'all'],
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
            'args' => $key['args']->getArrayCopy(),
            'context' => $key['context'],
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
            $statuses[] = $this->resolve(
                $key['proposal'],
                $key['args'],
                $key['viewer'],
                $key['context']
            );
        }

        return $statuses;
    }

    private function resolve(
        Proposal $proposal,
        Argument $args,
        $viewer,
        \ArrayObject $context
    ): ?Status {
        if ($args->offsetGet('step')) {
            $step = $this->globalIdResolver->resolve($args->offsetGet('step'), $viewer, $context);

            if ($step instanceof SelectionStep) {
                return self::resolveSelectionStep($step, $proposal);
            }

            //else : CollectStep, ConsultationStep, PresentationStep, QuestionnaireStep, RankingStep, SynthesisStep, OtherStep
        }

        return $proposal->getStatus();
    }

    /**
     * If the step if a selection step, we use the status of the selection.
     */
    private static function resolveSelectionStep(AbstractStep $step, Proposal $proposal): ?Status
    {
        foreach ($proposal->getSelections() as $selection) {
            if ($selection->getStep()->getId() === $step->getId()) {
                return $selection->getStatus();
            }
        }

        return $proposal->getStatus();
    }
}
