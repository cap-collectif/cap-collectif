<?php

namespace Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationTranslation;
use Capco\AppBundle\Enum\OrganizationAffiliation;
use Capco\UserBundle\Entity\User;
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

    public function findPaginated(
        ?int $limit,
        ?int $offset,
        ?string $search = null,
        array $affiliations = [],
        ?User $viewer = null
    ): array {
        $qb = $this->createQueryBuilder('o')
            ->setFirstResult($offset ?? 0)
            ->setMaxResults($limit ?? 50)
            ->addOrderBy('o.createdAt', 'DESC');
        if ($search) {
            $qb->innerJoin(
                OrganizationTranslation::class,
                'ot',
                Expr\Join::WITH,
                'o.id = ot.translatable'
            );
            $qb->andWhere('ot.title LIKE :title')->setParameter('title', "%${search}%");
        }
        if ($affiliations && $viewer) {
            if (\in_array(OrganizationAffiliation::USER, $affiliations)) {
                $qb->join('o.members', 'm');
                $qb->andWhere('m.user = :viewer');
                $qb->setParameter('viewer', $viewer);
            } elseif (\in_array(OrganizationAffiliation::ADMIN, $affiliations)) {
                $qb->join('o.members', 'm');
                $qb->andWhere('m.user = :viewer');
                $qb->andWhere('m.role = "admin"');
                $qb->setParameter('viewer', $viewer);
            }
        }

        return $qb->getQuery()->getResult();
    }
}
