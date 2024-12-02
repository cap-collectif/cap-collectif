<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\ORM\EntityManager;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\Router;

class CommentResolverSpec extends ObjectBehavior
{
    public function let(EntityManager $em, Router $router, UrlResolver $urlResolver)
    {
        $this->beConstructedWith($em, $router, $urlResolver);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CommentResolver::class);
    }

    public function it_can_create_comment_from_object_type()
    {
        $this->createCommentForType('Event')->shouldReturnAnInstanceOf(EventComment::class);
    }

    public function it_should_get_object_depending_on_type(EntityManager $em, Router $router, UrlResolver $urlResolver, EventRepository $eventRepo, Event $event)
    {
        $objectId = 1;
        $eventRepo->find($objectId)->willReturn($event)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Event')->willReturn($eventRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $router, $urlResolver);

        $this->getObjectByTypeAndId('Event', $objectId)->shouldReturn($event);
    }
}
