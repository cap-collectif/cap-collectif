<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class DebateArgumentVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(DebateArgumentVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        DebateArgument $debateArgument,
        DebateAnonymousArgument $debateAnonymousArgument,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.');

        $this->vote($token, $debateArgument, [DebateArgumentVoter::UPDATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $debateArgument, [DebateArgumentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
        $this->vote($token, $debateAnonymousArgument, [DebateArgumentVoter::PARTICIPATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_the_argument_author_to_edit_and_delete_his_argument(
        DebateArgument $debateArgument,
        TokenInterface $token,
        User $user
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user->isAdmin()->willReturn(false);
        $debateArgument->getAuthor()->willReturn($user);

        $this->vote($token, $debateArgument, [DebateArgumentVoter::UPDATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
        $this->vote($token, $debateArgument, [DebateArgumentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_admin_to_delete_argument(
        DebateArgument $debateArgument,
        TokenInterface $token,
        User $user
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user->isAdmin()->willReturn(true);

        $this->vote($token, $debateArgument, [DebateArgumentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_user_to_participate(
        DebateArgument $debateArgument,
        Debate $debate,
        TokenInterface $token,
        User $user
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user->isAdmin()->willReturn(true);
        $debateArgument->getDebate()->willReturn($debate);
        $debate->viewerCanParticipate($user)->willReturn(true);

        $this->vote($token, $debateArgument, [DebateArgumentVoter::PARTICIPATE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_not_allow_user_to_participate(
        DebateArgument $debateArgument,
        Debate $debate,
        TokenInterface $token,
        User $user
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $user->isAdmin()->willReturn(true);
        $debateArgument->getDebate()->willReturn($debate);
        $debate->viewerCanParticipate($user)->willReturn(false);

        $this->vote($token, $debateArgument, [DebateArgumentVoter::PARTICIPATE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_does_not_supports_attribute(User $user, Post $post, TokenInterface $token)
    {
        $this->vote($token, $user, [DebateArgumentVoter::UPDATE])->shouldBe(
            VoterInterface::ACCESS_ABSTAIN
        );
        $this->vote($token, $post, ['abc'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
