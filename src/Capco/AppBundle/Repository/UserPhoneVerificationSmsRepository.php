<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\Traits\Repository\PhoneVerification;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

/**
 * @method null|UserPhoneVerificationSms find($id, $lockMode = null, $lockVersion = null)
 * @method null|UserPhoneVerificationSms findOneBy(array $criteria, array $orderBy = null)
 * @method UserPhoneVerificationSms[]    findAll()
 * @method UserPhoneVerificationSms[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserPhoneVerificationSmsRepository extends EntityRepository
{
    use PhoneVerification;

    public function findLastByCreatedAtAndParticipant(User $user): ?UserPhoneVerificationSms
    {
        return $this->createQueryBuilder('p')
            ->orderBy('p.createdAt', 'DESC')
            ->where('p.user = :user')
            ->setParameter('user', $user)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
}
