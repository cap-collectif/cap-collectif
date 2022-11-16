<?php

namespace spec\Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Resolver\SettableOwnerResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class SettableOwnerResolverSpec extends ObjectBehavior
{
    public function let(GlobalIdResolver $resolver)
    {
        $this->beConstructedWith($resolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SettableOwnerResolver::class);
    }

    public function it_should_return_viewer_if_no_id(GlobalIdResolver $resolver, User $viewer)
    {
        $resolver->resolve(Argument::any(), Argument::any())->shouldNotBeCalled();
        $this->__invoke(null, $viewer)->shouldReturn($viewer);
    }

    public function it_should_return_error_if_wrong_id(GlobalIdResolver $resolver, User $viewer)
    {
        $wrongId = 'wrongId';
        $resolver
            ->resolve($wrongId, $viewer)
            ->shouldBeCalled()
            ->willReturn(null);
        $this->shouldThrow(new UserError(SettableOwnerResolver::OWNER_NOT_FOUND))->during(
            '__invoke',
            [$wrongId, $viewer]
        );
    }

    public function it_should_return_error_if_id_of_something_not_owner(
        GlobalIdResolver $resolver,
        Project $project,
        User $viewer
    ) {
        $projectId = 'projectId';
        $resolver
            ->resolve($projectId, $viewer)
            ->shouldBeCalled()
            ->willReturn($project);
        $this->shouldThrow(new UserError(SettableOwnerResolver::OWNER_NOT_FOUND))->during(
            '__invoke',
            [$projectId, $viewer]
        );
    }

    public function it_should_return_error_if_different_user(
        GlobalIdResolver $resolver,
        User $viewer,
        User $otherUser
    ) {
        $otherUserId = 'otherUserId';
        $resolver
            ->resolve($otherUserId, $viewer)
            ->shouldBeCalled()
            ->willReturn($otherUser);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $this->shouldThrow(new UserError(SettableOwnerResolver::OWNER_NOT_FOUND))->during(
            '__invoke',
            [$otherUserId, $viewer]
        );
    }

    public function it_should_return_viewer_if_own_id(GlobalIdResolver $resolver, User $viewer)
    {
        $viewerId = 'viewerId';
        $resolver
            ->resolve($viewerId, $viewer)
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $this->__invoke($viewerId, $viewer)->shouldReturn($viewer);
    }

    public function it_should_return_other_user_if_admin(
        GlobalIdResolver $resolver,
        User $viewer,
        User $otherUser
    ) {
        $otherUserId = 'otherUserId';
        $resolver
            ->resolve($otherUserId, $viewer)
            ->shouldBeCalled()
            ->willReturn($otherUser);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $this->__invoke($otherUserId, $viewer)->shouldReturn($otherUser);
    }

    public function it_should_return_error_if_organization_not_member_of(
        GlobalIdResolver $resolver,
        User $viewer,
        Organization $organization
    ) {
        $organizationId = 'organizationId';
        $resolver
            ->resolve($organizationId, $viewer)
            ->shouldBeCalled()
            ->willReturn($organization);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($viewer)
            ->shouldBeCalled()
            ->willReturn(null);
        $this->shouldThrow(new UserError(SettableOwnerResolver::OWNER_NOT_FOUND))->during(
            '__invoke',
            [$organizationId, $viewer]
        );
    }

    public function it_should_return_organzation_if_member(
        GlobalIdResolver $resolver,
        User $viewer,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
        $organizationId = 'organizationId';
        $resolver
            ->resolve($organizationId, $viewer)
            ->shouldBeCalled()
            ->willReturn($organization);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization->getMembership($viewer)->willReturn($memberShip);
        $this->__invoke($organizationId, $viewer)->shouldReturn($organization);
    }

    public function it_should_return_organization_if_admin(
        GlobalIdResolver $resolver,
        User $viewer,
        Organization $organization
    ) {
        $organizationId = 'organizationId';
        $resolver
            ->resolve($organizationId, $viewer)
            ->shouldBeCalled()
            ->willReturn($organization);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $this->__invoke($organizationId, $viewer)->shouldReturn($organization);
    }
}