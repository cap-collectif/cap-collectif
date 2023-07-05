<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\GraphQL\Resolver\Organization\OrganizationAdminAccessResolver;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;

class OrganizationAdminAccessResolverSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OrganizationAdminAccessResolver::class);
    }

    public function it_should_return_false_if_viewer_not_logged_in(Organization $organization)
    {
        $this->__invoke($organization)->shouldReturn(false);
    }

    public function it_should_return_true_if_viewer_is_admin(Organization $organization, User $viewer)
    {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(true);
        $this->__invoke($organization, $viewer)->shouldReturn(true);
    }

    public function it_should_return_false_if_viewer_is_not_a_member(
        Organization $organization,
        User $viewer
    ) {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(false);
        $organization->getMembership($viewer)->shouldBeCalledOnce()->willReturn(null);
        $this->__invoke($organization, $viewer)->shouldReturn(false);
    }

    public function it_should_return_true_if_viewer_is_admin_organization(
        Organization $organization,
        User $viewer,
        OrganizationMember $organizationMember
    ) {
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(false);
        $organization->getMembership($viewer)->shouldBeCalledOnce()->willReturn($organizationMember);
        $organizationMember->getRole()->willReturn(OrganizationMemberRoleType::ADMIN);
        $this->__invoke($organization, $viewer)->shouldReturn(true);
    }
}
