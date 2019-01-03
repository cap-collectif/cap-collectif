<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\CollectStep\CollectStepCountProposalDataLoader;
use Capco\AppBundle\Repository\ProposalRepository;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class CollectStepProposalCountResolver implements ResolverInterface
{
    private $proposalRepository;
    private $collectStepCountProposalDataLoader;
    private $logger;

    public function __construct(
        ProposalRepository $proposalRepository,
        LoggerInterface $logger,
        CollectStepCountProposalDataLoader $collectStepCountProposalDataLoader
    ) {
        $this->proposalRepository = $proposalRepository;
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
