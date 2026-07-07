<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
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
}
