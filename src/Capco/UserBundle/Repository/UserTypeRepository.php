<?php

namespace Capco\UserBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\OrderDirection;
use Capco\AppBundle\Enum\UserTypeOrderField;
use Capco\AppBundle\Traits\LocaleRepositoryTrait;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\NonUniqueResultException;
use Doctrine\ORM\NoResultException;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;

/**
 * @method null|UserType find($id, $lockMode = null, $lockVersion = null)
 * @method null|UserType findOneBy(array $criteria, array $orderBy = null)
 * @method UserType[]    findAll()
 * @method UserType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserTypeRepository extends EntityRepository
{
    use LocaleRepositoryTrait;

    /**
     * @return array<int, mixed>
     */
    public function findAllToArray(?string $locale = null): array
    {
        $locale = $this->getLocale($locale);

        $qb = $this->createQueryBuilder('ut')
            ->select('utt.name as name, ut.id as id')
            ->leftJoin('ut.translations', 'utt')
            ->where('utt.locale = :locale')
            ->setParameter('locale', $locale)
        ;

        return $qb->getQuery()->getArrayResult();
    }

    /**
     * @param array<string, string> $orderBy
     *
     * @return UserType[]
     */
    public function findAllPaginated(
        int $offset = 0,
        int $limit = 50,
        array $orderBy = [
            'field' => UserTypeOrderField::SORT_FIELD[UserTypeOrderField::CREATED_AT],
            'direction' => OrderDirection::DESC,
        ]
    ): array {
        $qb = $this->createQueryBuilder('ut');

        // todo refacto: remake all these order by checks and constants in a consistent and practical system
        if (
            [] !== $orderBy
            && \array_key_exists('field', $orderBy)
            && \array_key_exists('direction', $orderBy)
            && \array_key_exists($orderBy['field'], UserTypeOrderField::SORT_FIELD)
            && \array_key_exists($orderBy['direction'], OrderDirection::SORT_DIRECTION)
        ) {
            $field = UserTypeOrderField::SORT_FIELD[$orderBy['field']];
            $direction = OrderDirection::SORT_DIRECTION[$orderBy['direction']];
            $qb->orderBy("p.{$field}", $direction);
        }

        return $qb
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult()
        ;
    }

    public function findOneBySlug(?string $slug): ?UserType
    {
        $qb = $this->createQueryBuilder('ut')
            ->leftJoin('ut.translations', 'utt')
            ->where('utt.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }

    public function getUserTypesWithProposalsCountForStep(
        CollectStep $step,
        $limit = null,
        ?string $locale = null
    ) {
        $locale = $this->getLocale($locale);

        $qb = $this->createQueryBuilder('ut')
            ->select('utt.name as name')
            ->leftJoin('ut.translations', 'utt')
            ->addSelect(
                '(
                SELECT COUNT(p.id) as pCount
                FROM CapcoAppBundle:Proposal p
                LEFT JOIN p.proposalForm pf
                LEFT JOIN p.author pa
                LEFT JOIN pa.userType paut
                WHERE pf.step = :step
                AND p.published = true
                AND paut.id = ut.id
                AND p.trashedStatus IS NULL
            ) as value'
            )
            ->where('utt.locale = :locale')
            ->setParameter('locale', $locale)
            ->setParameter('step', $step)
            ->orderBy('value', 'DESC')
        ;
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    /**
     * @throws NonUniqueResultException
     * @throws NoResultException
     */
    public function countAll(): int
    {
        $qb = $this->createQueryBuilder('ut')->select('COUNT(ut.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @throws OptimisticLockException
     * @throws ORMException
     */
    public function remove(UserType $entity, bool $flush = true): void
    {
        $this->_em->remove($entity);
        if ($flush) {
            $this->_em->flush();
        }
    }
}
