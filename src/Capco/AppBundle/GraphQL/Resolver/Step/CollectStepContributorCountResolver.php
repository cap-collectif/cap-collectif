<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepContributorCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class CollectStepContributorCountResolver implements ResolverInterface
{
    private $collectStepCountContributorDataLoader;
    private $logger;

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
