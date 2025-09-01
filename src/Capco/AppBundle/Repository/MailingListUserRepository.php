<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\MailingListUser;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;

class MailingListUserRepository extends EntityRepository
{
    /**
     * @return array<MailingListUser>
     */
    public function getMailingListUserByUser(User $user): array
    {
        return $this->createQueryBuilder('mlu')
            ->where('mlu.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult()
            ;
    }
}
