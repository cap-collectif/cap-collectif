<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationTranslation;
use Capco\AppBundle\Entity\ProjectAuthor;
use Doctrine\ORM\EntityRepository;
use Doctrine\ORM\Query\Expr;

/**
 * @method Organization|null find($id, $lockMode = null, $lockVersion = null)
 * @method Organization|null findOneBy(array $criteria, array $orderBy = null)
 * @method Organization[]    findAll()
 * @method Organization[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class OrganizationRepository extends EntityRepository
{
    public function findOneBySlug(string $slug): ?Organization
    {
        $qb = $this->createQueryBuilder('o');
        $qb->innerJoin(
            OrganizationTranslation::class,
            'ot',
            Expr\Join::WITH,
            'o.id = ot.translatable'
        )
            ->andWhere('ot.slug = :slug')
            ->setParameter('slug', $slug);

        return $qb->getQuery()->getOneOrNullResult();
    }
}
