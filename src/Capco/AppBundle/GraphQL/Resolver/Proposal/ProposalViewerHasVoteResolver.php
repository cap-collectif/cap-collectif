<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Psr\Log\LoggerInterface;

class ProposalViewerHasVoteResolver
{
    private $logger;
    private $abstractStepRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(AbstractStepRepository $repository,
                              ProposalCollectVoteRepository $proposalCollectVoteRepository,
                              ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
                              LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function __invoke(Proposal $proposal, Arg $args, User $user): bool
    {
        try {
            $step = $this->abstractStepRepository->find($args->offsetGet('step'));

            if ($step instanceof CollectStep) {
                return count($this->proposalCollectVoteRepository->getByProposalAndStepAndUser($proposal, $step, $user)) > 0;
            }
            if ($step instanceof SelectionStep) {
                return count($this->proposalSelectionVoteRepository->getByProposalAndStepAndUser($proposal, $step, $user)) > 0;
            }

            return false;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }
}
