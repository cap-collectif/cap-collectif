<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalVotableStepsResolver;

class ProposalCurrentVotableStepDataloader extends BatchDataLoader
{
    private $resolver;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalVotableStepsResolver $resolver,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        bool $enableCache
    ) {
        $this->resolver = $resolver;
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
        $results = [];

        foreach ($keys as $key) {
            // Batching could be very usefull here
            // https://github.com/cap-collectif/platform/issues/6806
            $results[] = $this->resolve($key['proposal']);
        }

        return $this->getPromiseAdapter()->createAll($results);
    }

    public function resolve(Proposal $proposal): ?AbstractStep
    {
        $votableSteps = $this->resolver->__invoke($proposal);

        $firstVotableStep = null;
        foreach ($votableSteps as $step) {
            if ($step->isOpen()) {
                $firstVotableStep = $step;

                break;
            }
        }
        if (!$firstVotableStep) {
            foreach ($votableSteps as $step) {
                if ($step->isFuture()) {
                    $firstVotableStep = $step;

                    break;
                }
            }
        }
        if (!$firstVotableStep) {
            foreach ($votableSteps as $step) {
                if ($step->isClosed()) {
                    $firstVotableStep = $step;

                    break;
                }
            }
        }

        return $firstVotableStep;
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
        ];
    }
}
