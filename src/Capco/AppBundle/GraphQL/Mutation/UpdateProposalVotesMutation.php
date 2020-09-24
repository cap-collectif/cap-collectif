<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;

class UpdateProposalVotesMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private AbstractStepRepository $stepRepo;
    private ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader;
    private LoggerInterface $logger;
    private GlobalIdResolver $globalIdResolver;
    private ProposalVoteAccountHandler $proposalVoteAccountHandler;

    public function __construct(
        EntityManagerInterface $em,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        AbstractStepRepository $stepRepo,
        ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        ProposalVoteAccountHandler $proposalVoteAccountHandler
    ) {
        $this->em = $em;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->stepRepo = $stepRepo;
        $this->viewerProposalVotesDataLoader = $viewerProposalVotesDataLoader;
        $this->logger = $logger;
        $this->globalIdResolver = $globalIdResolver;
        $this->proposalVoteAccountHandler = $proposalVoteAccountHandler;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $stepId = $input->offsetGet('step');
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        if (!$step) {
            throw new UserError(sprintf('Unknown step with id "%s"', $stepId));
        }
        $votesInput = $input->offsetGet('votes');

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository
                ->getByAuthorAndStep($viewer, $step, -1, 0)
                ->getIterator();
        } elseif ($step instanceof CollectStep) {
            $votes = $this->proposalCollectVoteRepository
                ->getByAuthorAndStep($viewer, $step, -1, 0)
                ->getIterator();
        } else {
            throw new UserError(sprintf('Not good step with id "%s"', $stepId));
        }

        foreach ($votes as $vote) {
            $voteInput = null;
            foreach ($votesInput as $currentInput) {
                if ((int) $vote->getId() === (int) $currentInput['id']) {
                    $voteInput = $currentInput;
                }
            }
            if ($voteInput) {
                $vote->setPrivate($voteInput['anonymous']);
                if ($step->canContribute($viewer) && $step->isVotesRanking()) {
                    $vote->setPosition(array_search($voteInput, $votesInput, true));
                }
            } else {
                if (!$step->canContribute($viewer)) {
                    throw new UserError('This step is not contribuable.');
                }
                $this->em->remove($vote);
                $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted(
                    $step,
                    $vote,
                    $viewer,
                    false
                );
            }
        }

        $this->em->flush();

        $this->viewerProposalVotesDataLoader->invalidate($viewer);

        return ['step' => $step, 'viewer' => $viewer];
    }
}
