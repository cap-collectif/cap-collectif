<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Mutation\Organization\DeleteOrganizationMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class DeleteOrganizationMutationSpec extends ObjectBehavior
{
    public function let(EntityManagerInterface $em, GlobalIdResolver $globalIdResolver)
    {
        $this->beConstructedWith($em, $globalIdResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteOrganizationMutation::class);
    }

    public function it_should_dont_find_organization(Arg $input, User $viewer, GlobalIdResolver $globalIdResolver)
    {
        $input->offsetGet('organizationId')->willReturn('no_found_orga');
        $globalIdResolver->resolve('no_found_orga', $viewer)->willReturn(null);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => DeleteOrganizationMutation::ORGANIZATION_NOT_FOUND]);
    }

    public function it_delete_organization(Arg $input, User $viewer, GlobalIdResolver $globalIdResolver, Organization $organization, EntityManagerInterface $em)
    {
        $input->offsetGet('organizationId')->willReturn('organization');
        $globalIdResolver->resolve('organization', $viewer)->willReturn($organization);
        $organization->remove()->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->__invoke($input, $viewer)->shouldBe(['deletedOrganization' => $organization]);
    }
}