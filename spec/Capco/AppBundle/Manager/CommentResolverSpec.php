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
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

use Doctrine\ORM\EntityManager;
use Symfony\Component\Routing\Router;

class CommentResolverSpec extends ObjectBehavior
{
    function let(EntityManager $em, Router $router)
    {
        $this->beConstructedWith($em, $router);
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

    function it_should_get_object_depending_on_type(EntityManager $em, Router $router, IdeaRepository $ideaRepo, EventRepository $eventRepo, Idea $idea, Event $event)
    {
        $objectId = 1;
        $ideaRepo->find($objectId)->willReturn($idea)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Idea')->willReturn($ideaRepo)->shouldBeCalled();
        $eventRepo->find($objectId)->willReturn($event)->shouldBeCalled();
        $em->getRepository('CapcoAppBundle:Event')->willReturn($eventRepo)->shouldBeCalled();
        $this->beConstructedWith($em, $router);

        $this->getObjectByTypeAndId('Idea', $objectId)->shouldReturn($idea);
        $this->getObjectByTypeAndId('Event', $objectId)->shouldReturn($event);

    }

    function it_can_get_best_index_for_breaking_comment_body(AbstractComment $comment)
    {
        $limit = 10;

        // "Usual" case : text with spaces
        $comment->getBody()
            ->willReturn("Bonjour! Je suis un texte avec des espaces.")
            ->shouldBeCalled();
        $this->getBestBreakIndexForComment($comment, $limit)->shouldReturn(8);

        // Text too short
        $comment->getBody()
            ->willReturn("Bonjour !")
            ->shouldBeCalled();
        $this->getBestBreakIndexForComment($comment, $limit)->shouldReturn(10);

        // Text with no spaces or line breaks
        $comment->getBody()
            ->willReturn("Anticonstitutionnellement!")
            ->shouldBeCalled();
        $this->getBestBreakIndexForComment($comment, $limit)->shouldReturn(10);

        // Text with line break after space
        $comment->getBody()
            ->willReturn("Je suis\nune partie de texte\n")
            ->shouldBeCalled();
        $this->getBestBreakIndexForComment($comment, $limit)->shouldReturn(7);

        // Text with no spaces but line breaks
        $comment->getBody()
            ->willReturn("Je\nsuis\nune\npartie\nde\ntexte\n")
            ->shouldBeCalled();
        $this->getBestBreakIndexForComment($comment, $limit)->shouldReturn(7);
    }


}
