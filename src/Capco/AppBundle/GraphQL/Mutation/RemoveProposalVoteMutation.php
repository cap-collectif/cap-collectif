<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;

class RemoveProposalVoteMutation implements MutationInterface
{
    private $em;
    private $proposalRepo;
    private $stepRepo;
    private $proposalVotesDataLoader;
    private $proposalCollectVoteRepository;
    private $proposalSelectionVoteRepository;
    private $proposalViewerVoteDataLoader;
    private $proposalViewerHasVoteDataLoader;
    private $viewerProposalVotesDataloader;
    private $indexer;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepo,
        AbstractStepRepository $stepRepo,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        ViewerProposalVotesDataLoader $viewerProposalVotesDataloader,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->stepRepo = $stepRepo;
        $this->proposalRepo = $proposalRepo;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalViewerVoteDataLoader = $proposalViewerVoteDataLoader;
        $this->proposalViewerHasVoteDataLoader = $proposalViewerHasVoteDataLoader;
        $this->indexer = $indexer;
        $this->viewerProposalVotesDataloader = $viewerProposalVotesDataloader;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $proposal = $this->proposalRepo->find($input->offsetGet('proposalId'));
        $step = $this->stepRepo->find($input->offsetGet('stepId'));

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $input->offsetGet('proposalId'));
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $input->offsetGet('stepId'));
        }

        $vote = null;
        if ($step instanceof CollectStep) {
            $vote = $this->proposalCollectVoteRepository->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'collectStep' => $step,
            ]);
        } elseif ($step instanceof SelectionStep) {
            $vote = $this->proposalSelectionVoteRepository->findOneBy([
                'user' => $user,
                'proposal' => $proposal,
                'selectionStep' => $step,
            ]);
        } else {
            throw new UserError('Wrong step with id: ' . $input->offsetGet('stepId'));
        }

        if (!$vote) {
            throw new UserError('You have not voted for this proposal in this step.');
        }

        // Check if step is contributable
        if (!$step->canContribute($user)) {
            throw new UserError('This step is no longer contributable.');
        }

        $this->em->remove($vote);
        $this->em->flush();
        $this->proposalVotesDataLoader->invalidate($proposal);
        $this->proposalViewerVoteDataLoader->invalidate($proposal);
        $this->proposalViewerHasVoteDataLoader->invalidate($proposal);
        $this->viewerProposalVotesDataloader->invalidate($user);

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;

        return ['proposal' => $proposal, 'step' => $step, 'viewer' => $user];
    }
}
