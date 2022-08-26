<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Ownerable;

use Capco\AppBundle\Entity\Interfaces\Ownerable;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\Organization\OrganizationAdminAccessResolver;
use Capco\AppBundle\GraphQL\Resolver\Ownerable\OwnerableCreatorAccessResolver;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class OwnerableCreatorAccessResolverSpec extends ObjectBehavior
{
    public function let(OrganizationAdminAccessResolver $organizationAdminAccessResolver)
    {
        $this->beConstructedWith($organizationAdminAccessResolver);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OwnerableCreatorAccessResolver::class);
    }

    public function it_should_return_false_if_user_not_logged_in(Ownerable $project)
    {
        $this->__invoke($project)->shouldReturn(false);
    }

    public function it_should_return_true_if_user_is_admin(Ownerable $project, User $viewer)
    {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(true);
        $this->__invoke($project, $viewer)->shouldReturn(true);
    }

    public function it_should_return_true_if_user_is_admin_organization(
        Ownerable $project,
        User $viewer,
        Organization $organization,
        OrganizationAdminAccessResolver $organizationAdminAccessResolver
    )
    {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(false);
        $project->getOwner()->shouldBeCalledOnce()->willReturn($organization);
        $organizationAdminAccessResolver->__invoke($organization, $viewer)->willReturn(true);
        $this->__invoke($project, $viewer)->shouldReturn(true);
    }

    public function it_should_return_false_if_no_condition_is_met(
        Ownerable $project,
        User $viewer
    )
    {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(false);
        $project->getOwner()->shouldBeCalledOnce()->willReturn($viewer);
        $this->__invoke($project, $viewer)->shouldReturn(false);
    }

}