<?php

namespace spec\Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\AbstractComment;
use Capco\AppBundle\Repository\EventCommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\IdeaCommentRepository;
use Capco\AppBundle\Repository\IdeaRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

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
        $this->createCommentForType('Idea')->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\IdeaComment');
        $this->createCommentForType('Event')->shouldReturnAnInstanceOf('Capco\AppBundle\Entity\EventComment');
    }

    function it_should_get_object_depending_on_type(EntityManager $em, Router $router, UrlResolver $urlResolver, IdeaRepository $ideaRepo, EventRepository $eventRepo, Idea $idea, Event $event)
    {
        $objectId = 1;
        $ideaRepo->find($objectId)->willReturn($idea)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Idea')->willReturn($ideaRepo)->shouldBeCalled();
        $eventRepo->find($objectId)->willReturn($event)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Event')->willReturn($eventRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $router, $urlResolver);

        $this->getObjectByTypeAndId('Idea', $objectId)->shouldReturn($idea);
        $this->getObjectByTypeAndId('Event', $objectId)->shouldReturn($event);

    }
}
