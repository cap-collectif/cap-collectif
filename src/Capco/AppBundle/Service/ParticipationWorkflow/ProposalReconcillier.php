<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Requirement;
use Doctrine\ORM\EntityManagerInterface;

class ProposalReconcillier extends ContributionsReconcilier
{
    public function __construct(EntityManagerInterface $em)
    {
        parent::__construct($em);
    }

    public function reconcile(Participant $participant, ContributorInterface $contributorTarget): void
    {
        $this->disableCompletionStatusFilter();

        $proposals = $participant->getProposals()->toArray();

        foreach ($proposals as $proposal) {
            $step = $proposal->getProposalForm()->getStep();

            if ($step && $step->isClosed()) {
                continue;
            }

            $isSameEmail = $participant->getEmail() === $contributorTarget->getEmail() && ($participant->isEmailConfirmed() && $contributorTarget->isEmailConfirmed());

            $hasSSORequirement = $step->getRequirements()?->filter(fn (Requirement $requirement) => Requirement::SSO === $requirement->getType())->count() > 0;
            if (!$hasSSORequirement && !$isSameEmail) {
                continue;
            }

            $this->reconcileContributor($proposal, $contributorTarget);
        }

        $this->em->flush();
    }
}
