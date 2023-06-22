<?php

namespace spec\Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\EventRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query\Expr;
use Doctrine\ORM\QueryBuilder;
use PhpSpec\ObjectBehavior;

class EventRepositorySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(EventRepository::class);
    }

    public function let(EntityManagerInterface $em, ClassMetadata $class, QueryBuilder $qb)
    {
        $alias = 'e';
        $class->name = 'e';
        $em->createQueryBuilder()->willReturn($qb);
        $qb->select($alias)->willReturn($qb);
        $qb->from($class->name, $alias, null)->willReturn($qb);

        $this->beConstructedWith($em, $class);
    }

    public function it_can_get_events_by_owner_user(QueryBuilder $qb, User $user): void
    {
        $user
            ->getId()
            ->shouldBeCalled()
            ->willReturn('userId');

        $qb->leftJoin('e.owner', 'o')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere('o.id = :ownerId')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('ownerId', 'userId')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->orderBy('e.startAt', 'DESC')
            ->shouldBeCalled()
            ->willReturn($qb);
        $this->getByOwnerQueryBuilder($user, [])->shouldReturn($qb);
    }

    public function it_can_get_events_by_owner_organization(
        QueryBuilder $qb,
        Organization $organization,
        Expr $expr
    ): void {
        $organization
            ->getId()
            ->shouldBeCalled()
            ->willReturn('organizationId');

        $qb->leftJoin('e.organizationOwner', 'o')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->andWhere('o.id = :ownerId')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->setParameter('ownerId', 'organizationId')
            ->shouldBeCalled()
            ->willReturn($qb);
        $qb->orderBy('e.startAt', 'DESC')
            ->shouldBeCalled()
            ->willReturn($qb);
        $this->getByOwnerQueryBuilder($organization, [])->shouldReturn($qb);
    }
}
