<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class RemoveProposalVoteMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly ProposalRepository $proposalRepo, private readonly AbstractStepRepository $stepRepo, private readonly ProposalVotesDataLoader $proposalVotesDataLoader, private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository, private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository, private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader, private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader, private readonly ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader, private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler, private readonly Indexer $indexer, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    public function __invoke(Argument $input, User $user): array
    {
        $this->formatInput($input);
        $proposal = $this->globalIdResolver->resolve($input->offsetGet('proposalId'), $user);
        $step = $this->globalIdResolver->resolve($input->offsetGet('stepId'), $user);

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $input->offsetGet('proposalId'));
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $input->offsetGet('stepId'));
        }

        /** @var AbstractVote $vote */
        $currentVote = null;
        if ($step instanceof CollectStep) {
            $currentVote = $this->proposalCollectVoteRepository->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'collectStep' => $step,
            ]);
        } elseif ($step instanceof SelectionStep) {
            $currentVote = $this->proposalSelectionVoteRepository->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'selectionStep' => $step,
            ]);
        } else {
            throw new UserError('Wrong step with id: ' . $input->offsetGet('stepId'));
        }

        if (!$currentVote) {
            throw new UserError('You have not voted for this proposal in this step.');
        }

        // Check if step is contributable
        if (!$step->canContribute($user)) {
            throw new UserError('This step is no longer contributable.');
        }

        $isAccounted = $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted(
            $step,
            $currentVote,
            $user,
            false
        );
        $previousVoteId = $currentVote->getId();
        $this->indexer->remove(ClassUtils::getClass($currentVote), $currentVote->getId());
        $this->em->remove($currentVote);
        $this->em->flush();
        $this->indexer->index(
            ClassUtils::getClass($currentVote->getProposal()),
            $currentVote->getProposal()->getId()
        );
        $this->indexer->finishBulk();

        $this->proposalVotesDataLoader->invalidate($proposal);
        $this->proposalViewerVoteDataLoader->invalidate($proposal);
        $this->proposalViewerHasVoteDataLoader->invalidate($proposal);
        $this->viewerProposalVotesDataLoader->invalidate($user);

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;

        return [
            'viewer' => $user,
            'previousVoteId' => $previousVoteId,
            'areRemainingVotesAccounted' => $isAccounted,
            'step' => $step,
        ];
    }
}
