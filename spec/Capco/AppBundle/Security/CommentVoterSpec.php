<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Security\CommentVoter;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class CommentVoterSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CommentVoter::class);
    }

    public function it_forbid_anonymous_to_do_anything(
        Comment $comment,
        TokenInterface $token
    ): void {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn('anon.')
        ;

        $this->vote($token, $comment, [CommentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_forbid_user_who_is_not_author_to_delete_the_comment(
        Comment $comment,
        TokenInterface $token,
        User $viewer,
        User $author
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(false);

        $comment->getAuthor()->willReturn($author);

        $this->vote($token, $comment, [CommentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_DENIED
        );
    }

    public function it_should_allow_author_to_delete_the_comment(
        Comment $comment,
        TokenInterface $token,
        User $viewer
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $comment->getAuthor()->willReturn($viewer);

        $this->vote($token, $comment, [CommentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_should_allow_admin_to_delete_the_comment(
        Comment $comment,
        TokenInterface $token,
        User $viewer
    ) {
        $token
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($viewer)
        ;

        $comment->getAuthor()->willReturn(null);
        $viewer->isAdmin()->shouldBeCalledOnce()->willReturn(true);

        $this->vote($token, $comment, [CommentVoter::DELETE])->shouldBe(
            VoterInterface::ACCESS_GRANTED
        );
    }

    public function it_does_not_supports_attribute(User $viewer, Post $post, TokenInterface $token)
    {
        $this->vote($token, $viewer, ['update'])->shouldBe(VoterInterface::ACCESS_ABSTAIN);
    }
}
