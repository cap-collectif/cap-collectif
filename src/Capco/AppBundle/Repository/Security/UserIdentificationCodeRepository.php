<?php

namespace Capco\AppBundle\Repository\Security;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr\Join;

/**
 * @method null|UserIdentificationCode find($id, $lockMode = null, $lockVersion = null)
 * @method null|UserIdentificationCode findOneBy(array $criteria, array $orderBy = null)
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
                'select uic.identification_code, fu.id as isUsedByUser, p.id as isUsedByParticipant
                     from user_identification_code uic
                     left join fos_user fu ON fu.user_identification_code = uic.identification_code
                     left join participant p ON p.user_identification_code = uic.identification_code
                     where uic.identification_code = ?
                     ',
                [$code]
            )
        ;

        return $qb->fetchAssociative();
    }

    public function getPlainCodes(): array
    {
        $data = $this->createQueryBuilder('uic')
            ->select('uic.identificationCode')
            ->getQuery()
            ->getArrayResult()
        ;

        return array_column($data, 'identificationCode');
    }

    public function countCodeUsedInList(UserIdentificationCodeList $list): int
    {
        $qb = $this->createQueryBuilder('uic')
            ->select('count(uic)')
            ->join(
                User::class,
                'fu',
                Join::WITH,
                'uic.identificationCode = fu.userIdentificationCode'
            )
            ->where('fu.id is not null')
            ->andWhere('uic.list = :list')
            ->setParameter('list', $list)
        ;

        return $qb->getQuery()->getSingleScalarResult();
    }
}
