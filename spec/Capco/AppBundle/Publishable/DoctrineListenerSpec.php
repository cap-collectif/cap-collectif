<?php

namespace spec\Capco\AppBundle\Publishable;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Publishable\DoctrineListener;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class DoctrineListenerSpec extends ObjectBehavior
{
    public function let(Manager $manager)
    {
        $this->beConstructedWith($manager);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DoctrineListener::class);
    }

    public function it_publish_if_author_is_confirmed(Publishable $publishable, User $author)
    {
        $author->isEmailConfirmed()->willReturn(true);
        $publishable->getAuthor()->willReturn($author);
        $publishable->setPublishedAt(Argument::any())->shouldBeCalled();
        $this->setPublishedStatus($publishable);
    }

    public function it_doesnt_publish_if_author_is_not_confirmed(
        Publishable $publishable,
        User $author
    ) {
        $author->isEmailConfirmed()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $publishable->setPublishedAt(Argument::any())->shouldNotBeCalled();
        $this->setPublishedStatus($publishable);
    }

    public function it_doesnt_publish_if_proposal_is_draft(DraftableInterface $draft, User $author)
    {
        $author->isEmailConfirmed()->willReturn(true);
        $draft->implement(Publishable::class);
        $draft->getAuthor()->willReturn($author);
        $draft->isDraft()->willReturn(true);
        $draft->setPublishedAt()->shouldNotBeCalled();
    }

    public function it_should_publish_comment_if_moderation_is_disabled_and_author_is_authenticated(
        Comment $comment,
        Manager $manager,
        User $author
    ) {
        $manager->isActive(Manager::moderation_comment)->shouldBeCalledOnce()->willReturn(false);
        $comment->getAuthor()->shouldBeCalledTimes(2)->willReturn($author);
        $comment->getAuthorEmail()->willReturn(null);

        $author->isEmailConfirmed()->willReturn(true);
        $comment->setPublishedAt(Argument::any())->shouldBeCalled();

        $this->handleCommentPublished($comment);
    }

    public function it_should_not_publish_comment_if_moderation_is_enabled_and_author_is_anonymous(
        Comment $comment,
        Manager $manager
    ) {
        $manager->isActive(Manager::moderation_comment)->shouldBeCalledOnce()->willReturn(true);
        $comment->getAuthorEmail()->willReturn('abc@cap-collectif.com');
        $comment->getAuthor()->willReturn(null);

        $this->handleCommentPublished($comment);
    }
}
