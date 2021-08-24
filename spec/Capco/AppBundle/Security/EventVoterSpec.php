<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Security\EventVoter;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
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

    public function it_forbid_anonymous_to_do_anything_in_admin(
        Event $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
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
    }

    public function it_forbid_anon_user_to_view_event_in_front_if_not_enabled_or_not_approved(
        Event $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');
        $subject->isEnabledOrApproved()->willReturn(false);

        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
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
        $user
            ->isOnlyUser()
            ->shouldBeCalled()
            ->willReturn(false);

        $subject->getOwner()->willReturn(null);
        $subject->getAuthor()->willReturn($author);

        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_DENIED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
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
        $user
            ->isOnlyUser()
            ->shouldBeCalled()
            ->willReturn(false);

        $subject->getOwner()->willReturn($user);

        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
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

        $user
            ->isOnlyUser()
            ->shouldBeCalled()
            ->willReturn(false);

        $manager->isActive('allow_users_to_propose_events')->willReturn(false);

        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
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

        $user->hasRole(UserRole::ROLE_USER)->willReturn(true);
        $manager->isActive('allow_users_to_propose_events')->willReturn(true);
        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_allow_author_to_do_anything_with_his_event(
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
            ->isOnlyUser()
            ->shouldBeCalled()
            ->willReturn(true);

        $manager->isActive('allow_users_to_propose_events')->willReturn(true);
        $user->hasRole(UserRole::ROLE_USER)->willReturn(true);

        $subject->getAuthor()->willReturn($user);

        $this->vote($token, $subject, [EventVoter::EDIT])->shouldBe(VoterInterface::ACCESS_GRANTED);
        $this->vote($token, $subject, [EventVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_ADMIN])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $subject, [EventVoter::VIEW_FRONT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $subject, [EventVoter::CREATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(User $user, Event $event, TokenInterface $token)
    {
        $this->vote($token, $user, [EventVoter::CREATE])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
        $this->vote($token, $event, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
