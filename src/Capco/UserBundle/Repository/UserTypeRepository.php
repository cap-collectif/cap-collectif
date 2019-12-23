<?php

namespace Capco\UserBundle\Repository;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Traits\LocaleRepositoryTrait;
use Capco\UserBundle\Entity\UserType;
use Doctrine\ORM\EntityRepository;

/**
 * UserTypeRepository.
 */
class UserTypeRepository extends EntityRepository
{
    use LocaleRepositoryTrait;

    public function findAllToArray(?string $locale = null)
    {
        $locale = $this->getLocale($locale);

        $qb = $this->createQueryBuilder('ut')
            ->select('utt.name as name, ut.id as id')
            ->leftJoin('ut.translations', 'utt')
            ->where('utt.locale = :locale')
            ->setParameter('locale', $locale);

        return $qb->getQuery()->getArrayResult();
    }

    public function findOneBySlug(?string $slug): ?UserType
    {
        $qb = $this->createQueryBuilder('ut')
            ->leftJoin('ut.translations', 'utt')
            ->where('utt.slug = :slug')
            ->setParameter('slug', $slug);

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
            ->orderBy('value', 'DESC');
        if ($limit) {
            $qb->setMaxResults($limit);
        }

        return $qb->getQuery()->getArrayResult();
    }

    public function countAll(): int
    {
        $qb = $this->createQueryBuilder('ut')->select('COUNT(ut.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }
}
