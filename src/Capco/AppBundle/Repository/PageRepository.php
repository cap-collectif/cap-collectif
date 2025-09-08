<?php

namespace Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Page;
use Doctrine\ORM\EntityRepository;

class PageRepository extends EntityRepository implements SluggableRepositoryInterface
{
    public function getAll()
    {
        $qb = $this->createQueryBuilder('p')->orderBy('p.createdAt', 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function getBySlug(string $slug): ?Page
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.translations', 'pt')
            ->andWhere('pt.slug = :slug')
            ->setParameter('slug', $slug)
        ;

        return $qb->getQuery()->getOneOrNullResult();
    }
}
