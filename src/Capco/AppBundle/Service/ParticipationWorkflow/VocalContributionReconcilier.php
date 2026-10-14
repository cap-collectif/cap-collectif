<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Doctrine\ORM\EntityManagerInterface;

class VocalContributionReconcilier extends ContributionsReconcilier
{
    public function __construct(
        EntityManagerInterface $em,
        private readonly VocalContributionRepository $vocalContributionRepository
    ) {
        parent::__construct($em);
    }

    public function reconcile(Participant $participant, ContributorInterface $contributorTarget): void
    {
        $this->disableCompletionStatusFilter();

        foreach ($this->vocalContributionRepository->findBy(['participant' => $participant]) as $vocalContribution) {
            $vocalContribution->setContributor($contributorTarget);
        }

        $this->em->flush();
    }
}
