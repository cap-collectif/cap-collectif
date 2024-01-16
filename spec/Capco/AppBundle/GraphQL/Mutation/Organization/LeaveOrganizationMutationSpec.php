<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\GraphQL\Mutation\Organization\LeaveOrganizationMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Organization\OrganizationMemberRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class LeaveOrganizationMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager,
        OrganizationMemberRepository $repository
    ) {
        $this->beConstructedWith($globalIdResolver, $entityManager, $repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(LeaveOrganizationMutation::class);
    }

    public function it_return_an_error(
        Arg $input,
        User $viewer,
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver
    ) {
        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('organizationId')->willReturn('organizationNotFound');
        $globalIdResolver->resolve('organizationNotFound', $viewer)->willReturn(null);

        $entityManager->flush()->shouldNotBeCalled();

        $this->__invoke($input, $viewer)->shouldBe([
            'errorCode' => LeaveOrganizationMutation::ORGANIZATION_NOT_FOUND,
        ]);
    }

    public function it_leave_organization(
        Arg $input,
        User $viewer,
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        Organization $organization,
        OrganizationMember $organizationMember1,
        OrganizationMember $organizationMember2,
        Organization $organization2,
        OrganizationMemberRepository $repository
    ) {
        $organization->getId()->willReturn('organization1');
        $this->getMockedGraphQLArgumentFormatted($input);
        $input->offsetGet('organizationId')->willReturn('organization1');
        $globalIdResolver->resolve('organization1', $viewer)->willReturn($organization);

        $organization2->getId()->willReturn('organization2');
        $organizationMember1->getOrganization()->willReturn($organization);
        $organizationMember2->getOrganization()->willReturn($organization2);
        $repository
            ->findOneBy(['user' => $viewer, 'organization' => $organization])
            ->willReturn($organizationMember1)
        ;
        $viewer
            ->getMemberOfOrganizations()
            ->willReturn(new ArrayCollection([$organizationMember1, $organizationMember2]))
        ;

        $viewer
            ->removeOrganization($organization)
            ->shouldBeCalled()
            ->willReturn([$organization2])
        ;
        $entityManager->remove($organizationMember1)->shouldBeCalled();
        $entityManager->flush()->shouldBeCalled();

        $this->__invoke($input, $viewer)->shouldBe([
            'errorCode' => null,
            'organizations' => [$organization2],
        ]);
    }
}
