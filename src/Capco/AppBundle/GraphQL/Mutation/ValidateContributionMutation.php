<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractProposalVote;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Service\ReplyCounterIndexer;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ValidateContributionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver,
        private readonly ViewerIsMeetingRequirementsResolver $viewerIsMeetingRequirementsResolver,
        private readonly UrlResolver $stepUrlResolver,
        private readonly ParticipantHelper $participantHelper,
        private readonly ReplyCounterIndexer $replyCounterIndexer,
        private readonly ProposalVoteAccountHandler $proposalVoteAccountHandler,
        private readonly Indexer $indexer,
        private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository,
        private readonly ProjectParticipantsTotalCountCacheHandler $projectParticipantsTotalCountCacheHandler,
        private readonly ParticipantRepository $paritcipantRepository,
    ) {
    }

    /**
     * @return array{'redirectUrl': string, 'errorCode'?: null|string}
     */
    public function __invoke(Argument $input, ?User $viewer = null): array
    {
        $this->formatInput($input);
        $token = $input->offsetGet('token');

        if (!$viewer && !$token) {
            throw new UserError('You must be logged in or send a participant token');
        }

        try {
            $participant = $this->participantHelper->getParticipantByToken($token);
        } catch (ParticipantNotFoundException) {
            $participant = null;
        }

        $contributor = $participant ?? $viewer;

        $contributionId = $input->offsetGet('contributionId');
        $contribution = $this->getContribution($contributionId);
        $step = $this->getStep($contribution);

        if (!$step->isOpen()) {
            throw new UserError('Step closed');
        }

        $redirectUrl = $this->getRedirectUrl($contribution);

        $this->validateContribution($contributor, $contribution);

        $this->em->flush();

        return ['redirectUrl' => $redirectUrl];
    }

    private function getContribution(string $contributionId): ContributionInterface
    {
        $contribution = $this->globalIdResolver->resolve($contributionId);

        if (!$contribution instanceof ContributionInterface) {
            throw new UserError('Contribution should either be of type Reply, Proposal or Vote');
        }

        return $contribution;
    }

    private function getStep(ContributionInterface $contribution): AbstractStep
    {
        if ($contribution instanceof Reply) {
            return $contribution->getQuestionnaire()->getStep();
        }
        if ($contribution instanceof Proposal) {
            return $contribution->getStep();
        }
        if ($contribution instanceof ProposalSelectionVote) {
            return $contribution->getSelectionStep();
        }
        if ($contribution instanceof ProposalCollectVote) {
            return $contribution->getCollectStep();
        }

        throw new UserError('No Step found for this contribution');
    }

    private function validateContribution(ContributorInterface $contributor, ContributionInterface $contribution): void
    {
        $step = $this->getStep($contribution);

        if ($contributor instanceof Participant) {
            $this->validateParticipant($contribution, $contributor, $step);
        }

        if ($contributor instanceof User) {
            $this->validateViewer($contribution, $contributor, $step);
        }

        $contribution->setCompletedStatus();
        $contribution->setPublishedAt(new \DateTime());

        if ($contribution instanceof Reply) {
            $this->replyCounterIndexer->syncIndex($contribution);
        }

        if ($contribution instanceof AbstractProposalVote) {
            if ($contributor instanceof Participant) {
                $project = $step->getProject();
                $hasAlreadyParticipatedInThisProject = $this->paritcipantRepository->findWithContributionsByProjectAndParticipant($project, $contributor);

                $this->proposalVoteAccountHandler->checkIfParticipantVotesAreStillAccounted($step, $contribution, $contributor, true);
                $this->em->flush();
                $this->indexer->index(AbstractVote::class, $contribution->getId());
                $this->indexer->index(Proposal::class, $contribution->getProposal()->getId());

                if ($step->isVotesRanking()) {
                    $votes = [];
                    if ($contribution instanceof ProposalSelectionVote) {
                        $votes = $this->proposalSelectionVoteRepository->findBy(['selectionStep' => $step, 'participant' => $contributor]);
                    } elseif ($contribution instanceof ProposalCollectVote) {
                        $votes = $this->proposalCollectVoteRepository->findBy(['collectStep' => $step, 'participant' => $contributor]);
                    }
                    foreach ($votes as $vote) {
                        $this->indexer->index(AbstractVote::class, $vote->getId());
                    }
                }

                $this->projectParticipantsTotalCountCacheHandler->incrementTotalCount(
                    project: $project,
                    conditionCallBack: fn ($cachedItem): bool => $cachedItem->isHit() && !$hasAlreadyParticipatedInThisProject,
                );

                $this->indexer->finishBulk();
            } elseif ($contributor instanceof User) {
                $this->proposalVoteAccountHandler->checkIfUserVotesAreStillAccounted($step, $contribution, $contributor, true);
                $this->em->flush();
                $this->indexer->index(AbstractVote::class, $contribution->getId());
                $this->indexer->finishBulk();

                $this->indexer->index(User::class, $contributor->getId());

                if ($step->isVotesRanking()) {
                    $votes = [];
                    if ($contribution instanceof ProposalSelectionVote) {
                        $votes = $this->proposalSelectionVoteRepository->findBy(['selectionStep' => $step, 'user' => $contributor]);
                    } elseif ($contribution instanceof ProposalCollectVote) {
                        $votes = $this->proposalCollectVoteRepository->findBy(['collectStep' => $step, 'user' => $contributor]);
                    }
                    foreach ($votes as $vote) {
                        $this->indexer->index(AbstractVote::class, $vote->getId());
                    }
                }
                $this->indexer->finishBulk();
            }
        }
    }

    private function validateParticipant(ContributionInterface $contribution, Participant $participant, AbstractStep $step): void
    {
        if ($contribution->getParticipant() !== $participant) {
            throw new UserError('Given participant is not the author of the contribution');
        }

        $this->validateParticipantRequirements($participant, $step);
    }

    private function validateViewer(ContributionInterface $contribution, User $viewer, AbstractStep $step): void
    {
        if ($contribution->getAuthor() !== $viewer) {
            throw new UserError('Given viewer is not the author of the contribution');
        }

        $this->validateViewerRequirements($step, $viewer);
    }

    private function validateParticipantRequirements(?Participant $participant, AbstractStep $step): void
    {
        $isMeetingTheRequirements = $this->participantIsMeetingRequirementsResolver->__invoke($participant, new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId())]));
        if (!$isMeetingTheRequirements) {
            throw new UserError('Participant does not meet requirements');
        }
    }

    private function validateViewerRequirements(AbstractStep $step, User $viewer): void
    {
        $isMeetingTheRequirements = $this->viewerIsMeetingRequirementsResolver->__invoke(new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $step->getId())]), $viewer);
        if (!$isMeetingTheRequirements) {
            throw new UserError('Viewer does not meet requirements');
        }
    }

    private function getRedirectUrl(ContributionInterface $contribution): string
    {
        $step = $this->getStep($contribution);

        return $this->stepUrlResolver->getStepUrl($step, true);
    }
}
