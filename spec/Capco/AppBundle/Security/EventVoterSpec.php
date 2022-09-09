<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\OrganizationMemberRoleType;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class EventVoterSpec extends ObjectBehavior
{
    public function let(Manager $manager)
    {
        $this->beConstructedWith($manager);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EventVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(Event $subject, TokenInterface $token): void
    {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');
        $subject
            ->isEnabledOrApproved()
            ->shouldBeCalled()
            ->willReturn(false);

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_anon_user_to_view_event_in_front_if_enabled_or_approved(
        Event $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');
        $subject->isEnabledOrApproved()->willReturn(true);

        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_forbid_project_admin_to_do_anything_with_someone_else_event(
        Event $subject,
        TokenInterface $token,
        User $user,
        User $author
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
            ->willReturn(true);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn(null);
        $subject->isEnabledOrApproved()->willReturn(false);

        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_project_admin_to_do_anything_with_his_event(
        Event $subject,
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
            ->willReturn(true);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($user);
        $subject->isEnabledOrApproved()->willReturn(false);

        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_admin_to_do_anything(
        Event $subject,
        TokenInterface $token,
        User $user,
        Manager $manager
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);
        $subject
            ->isEnabledOrApproved()
            ->shouldBeCalled()
            ->willReturn(false);

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_logged_in_user_to_create_an_event_when_feature_is_active(
        Event $subject,
        TokenInterface $token,
        User $user,
        Manager $manager
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
        $manager
            ->isActive('allow_users_to_propose_events')
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_forbid_logged_in_user_to_create_an_event_when_feature_is_not_active(
        Event $subject,
        TokenInterface $token,
        User $user,
        Manager $manager
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
        $manager
            ->isActive('allow_users_to_propose_events')
            ->shouldBeCalled()
            ->willReturn(false);

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_allow_owner_to_do_anything_with_his_event_except_admin_view(
        Event $subject,
        TokenInterface $token,
        User $user,
        Manager $manager
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
        $subject
            ->isEnabledOrApproved()
            ->shouldBeCalled()
            ->willReturn(false);
        $subject->getOwner()->willReturn($user);

        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_organization_member_to_create_view_and_edit(
        Event $subject,
        TokenInterface $token,
        User $viewer,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->getMemberOfOrganizations()
            ->shouldBeCalled()
            ->willReturn(new ArrayCollection([$memberShip]));
        $subject
            ->isEnabledOrApproved()
            ->shouldBeCalled()
            ->willReturn(false);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $subject
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn(null);
        $organization
            ->getMembership($viewer)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldReturn(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldReturn(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EXPORT])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_organization_creator_to_also_delete(
        Event $subject,
        TokenInterface $token,
        User $viewer,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $subject
            ->getCreator()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $organization
            ->getMembership($viewer)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::USER);

        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldReturn(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_organization_admin_to_also_delete(
        Event $subject,
        TokenInterface $token,
        User $viewer,
        Organization $organization,
        OrganizationMember $memberShip
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer);
        $viewer
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $viewer
            ->isProjectAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $subject
            ->getOwner()
            ->shouldBeCalled()
            ->willReturn($organization);
        $organization
            ->getMembership($viewer)
            ->shouldBeCalled()
            ->willReturn($memberShip);
        $memberShip
            ->getRole()
            ->shouldBeCalled()
            ->willReturn(OrganizationMemberRoleType::ADMIN);

        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldReturn(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldReturn(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(User $user, Event $event, TokenInterface $token)
    {
        $this->vote($token, $user, [EventVoter::CREATE])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
        $this->vote($token, $event, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
