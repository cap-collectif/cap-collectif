<?php
namespace spec\Capco\AppBundle\Publishable;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Model\Publishable;
use Capco\AppBundle\Publishable\DoctrineListener;

class DoctrineListenerSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(DoctrineListener::class);
    }

    function it_publish_if_author_is_confirmed(Publishable $publishable, User $author)
    {
        $author->isEmailConfirmed()->willReturn(true);
        $publishable->getAuthor()->willReturn($author);
        $publishable->setPublishedAt(Argument::any())->shouldBeCalled();
        $this->setPublishedStatus($publishable);
    }

    function it_doesnt_publish_if_author_is_not_confirmed(Publishable $publishable, User $author)
    {
        $author->isEmailConfirmed()->willReturn(false);
        $publishable->getAuthor()->willReturn($author);
        $publishable->setPublishedAt(Argument::any())->shouldNotBeCalled();
        $this->setPublishedStatus($publishable);
    }
}
