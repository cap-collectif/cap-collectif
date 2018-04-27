<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;

class CommentResolverSpec extends ObjectBehavior
{
    function let(EntityManager $em, Router $router, UrlResolver $urlResolver)
    {
        $this->beConstructedWith($em, $router, $urlResolver);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType('Capco\AppBundle\Manager\CommentResolver');
    }

    function it_can_create_comment_from_object_type()
    {
        $this->createCommentForType('Event')->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\EventComment');
    }

    function it_should_get_object_depending_on_type(EntityManager $em, Router $router, UrlResolver $urlResolver, EventRepository $eventRepo, Event $event)
    {
        $objectId = 1;
        $eventRepo->find($objectId)->willReturn($event)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Event')->willReturn($eventRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $router, $urlResolver);

        $this->getObjectByTypeAndId('Event', $objectId)->shouldReturn($event);
    }
}
