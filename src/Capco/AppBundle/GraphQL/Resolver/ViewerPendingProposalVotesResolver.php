<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ParticipationWorkflow\ParticipationCookieManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ViewerPendingProposalVotesResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalCollectVoteRepository $collectVotes,
        private readonly ProposalSelectionVoteRepository $selectionVotes,
        private readonly ParticipantHelper $participantHelper,
        private readonly RequestStack $requestStack,
        private readonly EntityManagerInterface $entityManager
    ) {}

    /** @return list<AbstractVote> */
    public function __invoke(CollectStep|SelectionStep $step, ?User $viewer = null): array
    {
        $contributor = $viewer;
        if (null === $contributor) {
            $token = $this->requestStack->getCurrentRequest()?->cookies->get(ParticipationCookieManager::PARTICIPANT_COOKIE);
            if (!$token) {
                return [];
            }

            try {
                $contributor = $this->participantHelper->getParticipantByToken($token);
            } catch (ParticipantNotFoundException) {
                return [];
            }
        }

        $filters = $this->entityManager->getFilters();
        $completionFilterWasEnabled = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);
        if ($completionFilterWasEnabled) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        try {
            if ($step instanceof CollectStep) {
                return $this->collectVotes->getVotesByStepAndContributor(
                    step: $step,
                    contributor: $contributor,
                    published: false,
                    completionStatus: ContributionCompletionStatus::MISSING_REQUIREMENTS,
                );
            }

            return $this->selectionVotes->getVotesByStepAndContributor(
                step: $step,
                contributor: $contributor,
                published: false,
                completionStatus: ContributionCompletionStatus::MISSING_REQUIREMENTS,
            );
        } finally {
            if ($completionFilterWasEnabled) {
                $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
        }
    }
}
