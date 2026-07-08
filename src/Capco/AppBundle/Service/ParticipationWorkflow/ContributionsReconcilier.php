<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Doctrine\ORM\EntityManagerInterface;

class ContributionsReconcilier
{
    public function __construct(
        protected EntityManagerInterface $em
    ) {
    }

    public function updateParticipantInfos(Participant $existingParticipant, Participant $newParticipant): void
    {
        $existingParticipant->setToken($newParticipant->getToken());
    }

    protected function reconcileContributor(ContributionInterface $contribution, ContributorInterface $contributorTarget): void
    {
        if ($contribution instanceof Reply || $contribution instanceof Proposal) {
            $contribution->setContributor($contributorTarget);
        }
    }

    protected function disableCompletionStatusFilter(): void
    {
        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }
    }

    protected function canReconcileForStep(
        AbstractStep $step,
        Participant $participant,
        ContributorInterface $contributorTarget
    ): bool {
        if ($this->hasRequirement($step, Requirement::SSO)) {
            return true;
        }

        if ($this->hasRequirement($step, Requirement::EMAIL_VERIFIED)) {
            if (null === $participant->getEmail()) {
                return true;
            }

            return $this->isSameConfirmedEmail($participant, $contributorTarget);
        }

        if ($this->hasRequirement($step, Requirement::PHONE_VERIFIED)) {
            return $this->isSameConfirmedPhone($participant, $contributorTarget);
        }

        return false;
    }

    private function hasRequirement(AbstractStep $step, string $requirementType): bool
    {
        return $step->getRequirements()->filter(
            fn (Requirement $requirement) => $requirementType === $requirement->getType()
        )->count() > 0;
    }

    private function isSameConfirmedEmail(Participant $participant, ContributorInterface $contributorTarget): bool
    {
        return $participant->getEmail() === $contributorTarget->getEmail()
            && $participant->isEmailConfirmed()
            && $contributorTarget->isEmailConfirmed()
        ;
    }

    private function isSameConfirmedPhone(Participant $participant, ContributorInterface $contributorTarget): bool
    {
        $participantPhone = $participant->getPhone();

        return null !== $participantPhone
            && $participantPhone === $contributorTarget->getPhone()
            && $participant->isPhoneConfirmed()
            && $contributorTarget->isPhoneConfirmed()
        ;
    }
}
