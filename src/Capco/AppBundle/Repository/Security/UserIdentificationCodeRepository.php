<?php

namespace Capco\AppBundle\Repository\Security;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * @method UserIdentificationCode|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserIdentificationCode|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserIdentificationCode[]    findAll()
 * @method UserIdentificationCode[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserIdentificationCodeRepository extends EntityRepository
{
    public function findCodeUsedOrNot(string $code)
    {
        $qb = $this->getEntityManager()
            ->getConnection()
            ->executeQuery(
                'select uic.identification_code, fu.id as isUsed from user_identification_code uic left join fos_user fu ON fu.user_identification_code = uic.identification_code where uic.identification_code = ?',
                [$code]
            );

        return $qb->fetchAssociative();
    }

    public function countCodeUsedInList(UserIdentificationCodeList $list): int
    {
        $qb = $this->createQueryBuilder('uic')
            ->select('count(uic)')
            ->join(
                'Capco\UserBundle\Entity\User',
                'fu',
                Join::WITH,
                'uic.identificationCode = fu.userIdentificationCode'
            )
            ->where('fu.id is not null')
            ->andWhere('uic.list = :list')
            ->setParameter('list', $list);

        return $qb->getQuery()->getSingleScalarResult();
    }
}
