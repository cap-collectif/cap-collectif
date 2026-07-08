<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
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

            if (!$step || !$this->canReconcileForStep($step, $participant, $contributorTarget)) {
                continue;
            }

            $this->reconcileContributor($proposal, $contributorTarget);
        }

        $this->em->flush();
    }
}
