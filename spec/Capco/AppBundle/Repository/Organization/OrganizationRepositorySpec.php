<?php

namespace spec\Capco\AppBundle\Repository\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationTranslation;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Query\Expr;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class OrganizationRepositorySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(OrganizationRepository::class);
    }

    public function let(EntityManagerInterface $em, ClassMetadata $class, QueryBuilder $qb)
    {
        $alias = 'o';
        $class->name = 'organization';
        $em->createQueryBuilder()->willReturn($qb);
        $qb->select($alias)->willReturn($qb);
        $qb->from($class->name, $alias, null)->willReturn($qb);

        $this->beConstructedWith($em, $class);
    }

    public function it_can_find_one_by_slug(
        QueryBuilder $qb,
        Query $query,
        Organization $organization
    ): void {
        $goodSlug = 'goodSlug';
        $qb->innerJoin(
            OrganizationTranslation::class,
            'ot',
            Expr\Join::WITH,
            'o.id = ot.translatable'
        )
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere('ot.slug = :slug')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('slug', $goodSlug)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->getQuery()
            ->shouldBeCalled()
            ->willReturn($query);
        $query
            ->getOneOrNullResult()
            ->shouldBeCalled()
            ->willReturn($organization);

        $this->findOneBySlug($goodSlug)->shouldReturn($organization);
    }

    public function it_return_null_for_slug_not_found(QueryBuilder $qb, Query $query): void
    {
        $badSlug = 'badSlug';
        $qb->innerJoin(
            OrganizationTranslation::class,
            'ot',
            Expr\Join::WITH,
            'o.id = ot.translatable'
        )
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere('ot.slug = :slug')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('slug', $badSlug)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->getQuery()
            ->shouldBeCalled()
            ->willReturn($query);
        $query
            ->getOneOrNullResult()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->findOneBySlug($badSlug)->shouldReturn(null);
    }

    public function it_find_paginated_results(QueryBuilder $qb, Query $query): void
    {
        $result = [];
        $qb->setFirstResult(0)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setMaxResults(50)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->addOrderBy('o.createdAt', 'DESC')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->getQuery()
            ->shouldBeCalled()
            ->willReturn($query);
        $query
            ->getResult()
            ->shouldBeCalled()
            ->willReturn($result);

        $this->findPaginated(null, null)->shouldReturn($result);
    }

    public function it_find_paginated_results_with_limit_and_offset(
        QueryBuilder $qb,
        Query $query
    ): void {
        $result = [];
        $limit = 24;
        $offSet = 42;
        $qb->setFirstResult($offSet)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setMaxResults($limit)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->addOrderBy('o.createdAt', 'DESC')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere(Argument::any())->shouldNotBeCalled();
        $qb->setParameter(Argument::any(), Argument::any())->shouldNotBeCalled();
        $qb->getQuery()
            ->shouldBeCalled()
            ->willReturn($query);
        $query
            ->getResult()
            ->shouldBeCalled()
            ->willReturn($result);

        $this->findPaginated($limit, $offSet)->shouldReturn($result);
    }

    public function it_find_paginated_results_with_search_and_affiliation(
        QueryBuilder $qb,
        Query $query,
        User $viewer
    ): void {
        $result = [];
        $search = 'search';
        $viewer->__toString()->willReturn('user');
        $qb->setFirstResult(0)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setMaxResults(50)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->addOrderBy('o.createdAt', 'DESC')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->innerJoin(
            OrganizationTranslation::class,
            'ot',
            Expr\Join::WITH,
            'o.id = ot.translatable'
        )->shouldBeCalled()->willReturn($qb);
        $qb->andWhere('ot.title LIKE :title')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('title', "%${search}%")
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->join('o.members', 'm')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere('m.user = :viewer')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('viewer', $viewer)
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->getQuery()
            ->shouldBeCalled()
            ->willReturn($query);
        $query->getResult()
            ->shouldBeCalled()
            ->willReturn($result);

        $this->findPaginated(null, null, $search, ['user'], $viewer)->shouldReturn($result);
    }
}
