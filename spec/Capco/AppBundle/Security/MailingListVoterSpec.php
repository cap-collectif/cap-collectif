<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\MailingList;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\MailingListVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class MailingListVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(MailingListVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        MailingList $list,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $list, [
            MailingListVoter::VIEW,
            MailingListVoter::CREATE,
            MailingListVoter::DELETE,
        ])->shouldBe(MailingListVoter::ACCESS_DENIED);
    }

    public function it_forbid_basic_user_to_do_anything(
        MailingList $list,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection());

        $this->vote($token, $list, [
            MailingListVoter::VIEW,
            MailingListVoter::CREATE,
            MailingListVoter::DELETE,
        ])->shouldBe(MailingListVoter::ACCESS_DENIED);
    }

    public function it_can_be_viewed_by_admin(
        MailingList $list,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $list, [MailingListVoter::VIEW])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_viewed_by_owner(
        MailingList $notOwnedList,
        MailingList $ownedList,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $ownedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($user);
        $notOwnedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $notOwnedList, [MailingListVoter::VIEW])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $ownedList, [MailingListVoter::VIEW])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_viewed_by_member_of_owner(
        MailingList $notOwnedList,
        MailingList $ownedList,
        TokenInterface $token,
        User $user,
        Organization $organization,
        OrganizationMember $memberShip
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($user)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $ownedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $notOwnedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $notOwnedList, [MailingListVoter::VIEW])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $ownedList, [MailingListVoter::VIEW])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_created_by_admin(TokenInterface $token, User $user): void
    {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, new MailingList(), [MailingListVoter::CREATE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_created_by_project_admin(TokenInterface $token, User $user): void
    {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, new MailingList(), [MailingListVoter::CREATE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_created_by_organisation_member(
        TokenInterface $token,
        User $user,
        OrganizationMember $memberShip
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection([$memberShip]));

        $this->vote($token, new MailingList(), [MailingListVoter::CREATE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_deleted_by_admin_if_deletable(
        MailingList $deletableList,
        MailingList $undeletableList,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $deletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(true);
        $undeletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(false);

        $this->vote($token, $deletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
        $this->vote($token, $undeletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
    }

    public function it_can_be_deleted_by_owner_if_deletable(
        MailingList $deletableList,
        MailingList $undeletableList,
        MailingList $notOwnedList,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $deletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($user);
        $deletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(true);
        $undeletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($user);
        $undeletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(false);
        $notOwnedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);

        $this->vote($token, $deletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
        $this->vote($token, $undeletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $notOwnedList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
    }

    public function it_can_be_deleted_by_organization_admin_if_deletable(
        MailingList $deletableList,
        MailingList $undeletableList,
        MailingList $notOwnedList,
        TokenInterface $tokenAdmin,
        User $admin,
        Organization $organization,
        OrganizationMember $adminMemberShip
    ): void {
        $tokenAdmin
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($admin);
        $admin
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($admin)
            ->shouldBeCalled()
            ->willReturn($adminMemberShip);
        $adminMemberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN);

        $notOwnedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);
        $undeletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $undeletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(false);
        $deletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $deletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($tokenAdmin, $notOwnedList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($tokenAdmin, $undeletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($tokenAdmin, $deletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }

    public function it_can_be_deleted_by_organization_creator_if_deletable(
        MailingList $deletableList,
        MailingList $undeletableList,
        MailingList $notCreatedList,
        MailingList $notOwnedList,
        TokenInterface $token,
        User $creator,
        Organization $organization,
        OrganizationMember $membership
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($creator);
        $creator
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $organization
            ->getMembership($creator)
            ->shouldBeCalled()
            ->willReturn($membership);
        $membership
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);

        $notOwnedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);
        $notCreatedList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $notCreatedList
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null);
        $undeletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $undeletableList
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($creator);
        $undeletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(false);
        $deletableList
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $deletableList
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($creator);
        $deletableList
            ->isDeletable()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $notOwnedList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $notCreatedList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $undeletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_DENIED
        );
        $this->vote($token, $deletableList, [MailingListVoter::DELETE])->shouldBe(
            MailingListVoter::ACCESS_GRANTED
        );
    }
}
