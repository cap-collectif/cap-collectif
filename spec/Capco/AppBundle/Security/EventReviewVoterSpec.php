<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Security\EventReviewVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class EventReviewVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(EventReviewVoter::class);
    }

    public function it_should_forbid_anonymous_to_do_review_event(
        EventReview $subject,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_super_admin_to_do_anything(
        EventReview $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_admin_to_only_review_awaiting_event(
        EventReview $subject,
        TokenInterface $token,
        User $user
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->isSuperAdmin()
            ->shouldBeCalled()
            ->willReturn(false);
        $user
            ->isAdmin()
            ->shouldBeCalled()
            ->willReturn(true);

        $subject
            ->getStatus()
            ->shouldBeCalled()
            ->willReturn(EventReviewStatusType::AWAITING);
        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );

        $subject
            ->getStatus()
            ->shouldBeCalled()
            ->willReturn(EventReviewStatusType::REFUSED);
        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );

        $subject
            ->getStatus()
            ->shouldBeCalled()
            ->willReturn(EventReviewStatusType::APPROVED);
        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );

        $subject
            ->getStatus()
            ->shouldBeCalled()
            ->willReturn(EventReviewStatusType::DELETED);
        $this->vote($token, $subject, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_does_not_supports_attribute(
        User $user,
        EventReview $event,
        TokenInterface $token
    ) {
        $this->vote($token, $user, [EventReviewVoter::EDIT])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $event, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
