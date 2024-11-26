<?php

namespace Capco\AppBundle\GraphQL\DataLoader\Proposal;

use Capco\AppBundle\Cache\RedisTagCache;
use Capco\AppBundle\DataCollector\GraphQLCollector;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\BatchDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalVotableStepsResolver;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Stopwatch\Stopwatch;

class ProposalCurrentVotableStepDataLoader extends BatchDataLoader
{
    private readonly ProposalVotableStepsResolver $resolver;
    private readonly AbstractStepRepository $stepRepo;

    public function __construct(
        PromiseAdapterInterface $promiseFactory,
        RedisTagCache $cache,
        LoggerInterface $logger,
        ProposalVotableStepsResolver $resolver,
        AbstractStepRepository $stepRepo,
        string $cachePrefix,
        int $cacheTtl,
        bool $debug,
        GraphQLCollector $collector,
        Stopwatch $stopwatch,
        bool $enableCache
    ) {
        $this->resolver = $resolver;
        $this->stepRepo = $stepRepo;
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

    protected function normalizeValue($value)
    {
        if ($value instanceof AbstractStep) {
            return $value->getId();
        }

        return $value;
    }

    protected function denormalizeValue($value)
    {
        if ($value) {
            return $this->stepRepo->getByIdWithCache($value);
        }

        return $value;
    }

    protected function getCacheTag($key): array
    {
        return [$key['proposal']->getId()];
    }

    protected function serializeKey($key): array
    {
        return [
            'proposalId' => $key['proposal']->getId(),
        ];
    }
}
