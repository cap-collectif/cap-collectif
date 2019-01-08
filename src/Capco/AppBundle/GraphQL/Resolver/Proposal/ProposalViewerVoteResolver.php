<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalViewerVoteResolver implements ResolverInterface
{
    private $logger;
    private $abstractStepRepository;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;

    public function __construct(
        AbstractStepRepository $repository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->abstractStepRepository = $repository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
    }

    public function __invoke(Proposal $proposal, Arg $args, User $user): ?AbstractVote
    {
        try {
            $step = $this->abstractStepRepository->find($args->offsetGet('step'));

            if ($step instanceof CollectStep) {
                return $this->proposalCollectVoteRepository->getByProposalAndStepAndUser(
                    $proposal,
                    $step,
                    $user
                );
            }
            if ($step instanceof SelectionStep) {
                return $this->proposalSelectionVoteRepository->getByProposalAndStepAndUser(
                    $proposal,
                    $step,
                    $user
                );
            }

            return null;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }
}
