<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerHasVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalViewerVoteDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class RemoveProposalSmsVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ProposalVotesDataLoader $proposalVotesDataLoader,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalViewerVoteDataLoader $proposalViewerVoteDataLoader,
        private readonly ProposalViewerHasVoteDataLoader $proposalViewerHasVoteDataLoader,
        private readonly Indexer $indexer,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ParticipantHelper $participantHelper,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly ParticipantRepository $participantRepository,
        private readonly ProjectParticipantsTotalCountCacheHandler $participantsTotalCountCacheHandler,
    ) {
    }

    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);
        $proposalId = $input->offsetGet('proposalId');
        $stepId = $input->offsetGet('stepId');
        $token = $input->offsetGet('token');

        $proposal = $this->globalIdResolver->resolve($proposalId);
        $step = $this->globalIdResolver->resolve($stepId);

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            return ['errorCode' => self::PARTICIPANT_NOT_FOUND];
        }

        if (!$proposal) {
            throw new UserError('Unknown proposal with id: ' . $proposalId);
        }
        if (!$step) {
            throw new UserError('Unknown step with id: ' . $stepId);
        }

        if ($step instanceof CollectStep) {
            $currentVote = $this->proposalCollectVoteRepository->findOneBy([
                'participant' => $participant,
                'proposal' => $proposal,
                'collectStep' => $step,
            ]);
        } elseif ($step instanceof SelectionStep) {
            $currentVote = $this->proposalSelectionVoteRepository->findOneBy([
                'participant' => $participant,
                'proposal' => $proposal,
                'selectionStep' => $step,
            ]);
        } else {
            throw new UserError('Wrong step with id: ' . $stepId);
        }

        if (!$currentVote) {
            throw new UserError('You have not voted for this proposal in this step.');
        }

        if (!$step->isOpen()) {
            throw new UserError('This step is no longer contributable.');
        }

        $this->removePendingVotes($step, $participant);

        $this->proposalVoteAccountHandler->checkIfParticipantVotesAreStillAccounted($step, $currentVote, $participant, false);

        $previousVoteId = $currentVote->getId();
        $wasAccounted = $currentVote->getIsAccounted();
        $this->indexer->remove(ClassUtils::getClass($currentVote), $previousVoteId);
        $this->em->remove($currentVote);
        $this->em->flush();
        $this->indexer->index(
            ClassUtils::getClass($currentVote->getProposal()),
            $currentVote->getProposal()->getId()
        );

        $this->proposalVotesDataLoader->invalidate($proposal);
        $this->proposalViewerVoteDataLoader->invalidate($proposal);
        $this->proposalViewerHasVoteDataLoader->invalidate($proposal);

        $hasAlreadyParticipatedInThisProject = $this->participantRepository->findWithContributionsByProjectAndParticipant($step->getProject(), $participant);
        $this->participantsTotalCountCacheHandler->decrementTotalCount(
            project: $step->getProject(),
            conditionCallBack: fn ($cachedItem) => $cachedItem->isHit() && !$hasAlreadyParticipatedInThisProject && $wasAccounted
        );

        // Synchronously index for mutation payload
        $this->proposalVotesDataLoader->useElasticsearch = false;

        return [
            'proposal' => $proposal,
            'previousVoteId' => $previousVoteId,
            'step' => $step,
            'participant' => $participant,
        ];
    }

    private function removePendingVotes(AbstractStep $step, Participant $participant): void
    {
        if (!$step instanceof CollectStep && !$step instanceof SelectionStep) {
            return;
        }

        if (null === $step->getVotesMin()) {
            return;
        }

        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if ($step instanceof SelectionStep) {
            $votes = $this->proposalSelectionVoteRepository->getVotesByStepAndContributor($step, $participant, false);
        } else {
            $votes = $this->proposalCollectVoteRepository->getVotesByStepAndContributor($step, $participant, false);
        }

        $this->em->getFilters()->enable(ContributionCompletionStatusFilter::FILTER_NAME);

        if ($step->getVotesMin() === \count($votes)) {
            foreach ($votes as $vote) {
                if (ContributionCompletionStatus::MISSING_REQUIREMENTS === $vote->getCompletionStatus()) {
                    $this->em->remove($vote);
                }
            }
        }
    }
}
