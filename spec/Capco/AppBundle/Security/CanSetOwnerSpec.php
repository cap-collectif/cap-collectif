<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Security\CanSetOwner;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;

class CanSetOwnerSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(CanSetOwner::class);
    }

    public function it_should_be_true_for_super_admin(
        User $viewer,
        User $otherUser,
        Organization $organization
    ) {
        $viewer
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->check($otherUser, $viewer)->shouldBe(true);
        $this->check($organization, $viewer)->shouldBe(true);
    }

    public function it_should_be_true_for_viewer(User $viewer)
    {
        $viewer
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(false);

        $this->check($viewer, $viewer)->shouldBe(true);
    }

    public function it_should_be_false_for_other_user(User $viewer, User $otherUser)
    {
        $viewer
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(false);

        $this->check($otherUser, $viewer)->shouldBe(false);
    }

    public function it_should_be_true_for_organisation_member(
        User $viewer,
        Organization $organization,
        ArrayCollection $members
    ) {
        $viewer
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembers()
            ->shouldBeCalled()
            ->willReturn($members);
        $members
            ->contains($viewer)
            ->shouldBeCalled()
            ->willReturn(true);

        $this->check($organization, $viewer)->shouldBe(true);
    }

    public function it_should_be_false_for_other_organisation(
        User $viewer,
        Organization $organization,
        ArrayCollection $members
    ) {
        $viewer
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembers()
            ->shouldBeCalled()
            ->willReturn($members);
        $members
            ->contains($viewer)
            ->shouldBeCalled()
            ->willReturn(false);

        $this->check($organization, $viewer)->shouldBe(false);
    }
}
