<?php

namespace spec\Capco\AppBundle\Publishable;

use Capco\AppBundle\Entity\Interfaces\DraftableInterface;
use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Publishable\DoctrineListener;

class DoctrineListenerSpec extends ObjectBehavior
{
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
}
