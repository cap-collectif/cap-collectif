<?php

namespace spec\Capco\AppBundle\Repository;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use Doctrine\ORM\Query;
use PhpSpec\ObjectBehavior;

class ProjectRepositorySpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProjectRepository::class);
    }

    public function let(
        EntityManagerInterface $em,
        ClassMetadata $class,
        QueryBuilder $qb
    ) {
        $alias = 'p';
        $class->name = 'project';
        $em->createQueryBuilder()->willReturn($qb);
        $qb->select($alias)->willReturn($qb);
        $qb->from($class->name, $alias, null)->willReturn($qb);

        $this->beConstructedWith($em, $class);
    }

    public function it_can_get_project_by_owner_user(
        QueryBuilder $qb,
        User $user
    ) {
        $user->getId()->shouldBeCalled()->willReturn('userId');
        $qb->leftJoin('p.owner', 'o')->shouldBeCalled()->willReturn($qb);
        $qb->andWhere('o.id = :ownerId')->shouldBeCalled()->willReturn($qb);
        $qb->setParameter('ownerId', 'userId')->shouldBeCalled()->willReturn($qb);
        $qb->orderBy('p.updatedAt', 'DESC')->shouldBeCalled()->willReturn($qb);
        $this->getByOwnerQueryBuilder($user)->shouldReturn($qb);
    }

    public function it_can_get_project_by_owner_organization(
        QueryBuilder $qb,
        Organization $organization
    ) {
        $organization->getId()->shouldBeCalled()->willReturn('organizationId');
        $qb->leftJoin('p.organizationOwner', 'o')->shouldBeCalled()->willReturn($qb);
        $qb->andWhere('o.id = :ownerId')->shouldBeCalled()->willReturn($qb);
        $qb->setParameter('ownerId', 'organizationId')->shouldBeCalled()->willReturn($qb);
        $qb->orderBy('p.updatedAt', 'DESC')->shouldBeCalled()->willReturn($qb);
        $this->getByOwnerQueryBuilder($organization)->shouldReturn($qb);
    }
}