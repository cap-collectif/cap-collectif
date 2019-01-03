<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProgressStepRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ProposalProgressStepsResolver implements ResolverInterface
{
    private $logger;

    private $progressStepRepository;

    public function __construct(
        LoggerInterface $logger,
        ProgressStepRepository $progressStepRepository
    ) {
        $this->logger = $logger;
        $this->progressStepRepository = $progressStepRepository;
    }

    public function __invoke(Proposal $proposal)
    {
        // die('toto');
        return $proposal->getProgressSteps();
        // return $this->progressStepRepository->findAll();
    }
}
