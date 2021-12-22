<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method UserPhoneVerificationSms|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserPhoneVerificationSms|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserPhoneVerificationSms[]    findAll()
 * @method UserPhoneVerificationSms[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserPhoneVerificationSmsRepository extends EntityRepository
{
    public function findByUserWithinOneMinuteRange(
        User $user
    ): array {

        $fromDate = (new \DateTime())->modify('-1 minute')->format('Y-m-d h:i:s');
        $toDate = (new \DateTime())->format('Y-m-d h:i:s');

        $qb = $this->createQueryBuilder('s')
            ->andWhere('s.user = :user')
            ->andWhere('s.createdAt BETWEEN :fromDate AND :toDate')
            ->setParameters([
                'user' => $user,
                'fromDate' => $fromDate,
                'toDate' => $toDate,
            ]);

        return $qb->getQuery()->getResult();
    }
}
