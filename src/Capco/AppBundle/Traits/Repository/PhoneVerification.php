<?php

namespace Capco\AppBundle\Traits\Repository;

use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Interfaces\PhoneVerificationSmsInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\UserBundle\Entity\User;

trait PhoneVerification
{
    public function countApprovedSms(): int
    {
        return (int) $this->createQueryBuilder('s')
            ->select('COUNT(s.id)')
            ->where('s.status = :status')
            ->setParameter('status', PhoneVerificationSmsInterface::APPROVED)
            ->getQuery()
            ->getSingleScalarResult()
            ;
    }

    /**
     * @return array<ContributorInterface>
     */
    public function findSmsWithinOneMinuteRange(ContributorInterface $entity): array
    {
        $entityName = $this->getClassNameEntity($entity);

        $fromDate = (new \DateTime())->modify('-1 minute')->format('Y-m-d H:i:s');
        $toDate = (new \DateTime())->format('Y-m-d H:i:s');

        $qb = $this->createQueryBuilder('s')
            ->andWhere("s.{$entityName} = :{$entityName}")
            ->andWhere('s.createdAt BETWEEN :fromDate AND :toDate')
            ->setParameters([
                $entityName => $entity,
                'fromDate' => $fromDate,
                'toDate' => $toDate,
            ])
        ;

        return $qb->getQuery()->getResult();
    }

    /**
     * @param Participant|User $entity
     *
     * @return null|ParticipantPhoneVerificationSms|UserPhoneVerificationSms
     */
    public function findMostRecentSms($entity)
    {
        $entityName = $this->getClassNameEntity($entity);

        $qb = $this->createQueryBuilder('s')
            ->where("s.{$entityName} = :{$entityName}")
            ->orderBy('s.createdAt', 'DESC')
            ->setParameters(["{$entityName}" => $entity])
        ;

        $results = $qb->getQuery()->getResult();

        return $results[0] ?? null;
    }

    /**
     * @return null|mixed|string
     */
    private function getClassNameEntity(ContributorInterface $entity)
    {
        $path = explode('\\', strtolower($entity::class));

        return array_pop($path);
    }
}
