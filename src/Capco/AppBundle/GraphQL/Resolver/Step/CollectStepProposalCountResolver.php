<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepProposalCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class CollectStepProposalCountResolver implements ResolverInterface
{
    private $collectStepCountProposalDataLoader;
    private $logger;

    public function __construct(
        LoggerInterface $logger,
        CollectStepProposalCountDataLoader $collectStepCountProposalDataLoader
    ) {
        $this->collectStepCountProposalDataLoader = $collectStepCountProposalDataLoader;
        $this->logger = $logger;
    }

    public function __invoke(CollectStep $collectStep): Promise
    {
        try {
            return $this->collectStepCountProposalDataLoader->load(['collectStep' => $collectStep]);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
