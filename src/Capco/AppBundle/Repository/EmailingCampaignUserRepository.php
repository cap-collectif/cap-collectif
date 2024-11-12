<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Entity\EmailingCampaignUser;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityRepository;

class EmailingCampaignUserRepository extends EntityRepository
{
    public function countAllByEmailingCampaign(EmailingCampaign $emailingCampaign): int
    {
        $qb = $this->createQueryBuilder('ecu')
            ->select('COUNT(ecu.emailingCampaign)')
            ->where('ecu.emailingCampaign = :emailingCampaign')
            ->setParameter('emailingCampaign', $emailingCampaign)
        ;

        return $qb->getQuery()->getSingleScalarResult() ?? 0;
    }

    /**
     * @return ArrayCollection<int, EmailingCampaignUser>
     */
    public function findUnsentByEmailingCampaign(EmailingCampaign $emailingCampaign, int $maxResults = 0): ArrayCollection
    {
        $qb = $this->createQueryBuilder('ecu')
            ->where('ecu.emailingCampaign = :emailingCampaign')
            ->andWhere('ecu.sentAt IS NULL')
            ->setParameter('emailingCampaign', $emailingCampaign)
        ;
        if ($maxResults > 0) {
            $qb->setMaxResults($maxResults);
        }
        $results = $qb->getQuery()->getResult();

        return new ArrayCollection($results);
    }
}
