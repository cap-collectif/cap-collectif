<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class CollectStepContributorCountResolver implements QueryInterface
{
    private readonly CollectStepContributorCountDataLoader $collectStepCountContributorDataLoader;
    private readonly LoggerInterface $logger;

    public function __construct(
        LoggerInterface $logger,
        CollectStepContributorCountDataLoader $collectStepCountContributorDataLoader
    ) {
        $this->collectStepCountContributorDataLoader = $collectStepCountContributorDataLoader;
        $this->logger = $logger;
    }

    public function __invoke(CollectStep $collectStep): Promise
    {
        try {
            return $this->collectStepCountContributorDataLoader->load([
                'collectStep' => $collectStep,
            ]);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
