<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpKernel\KernelEvents;

class ElasticsearchRabbitMQListenerSpec extends ObjectBehavior
{
    public function let(Publisher $publisher, LoggerInterface $logger)
    {
        $this->beConstructedWith($publisher, $logger);
    }

    public function it_subscribe_events()
    {
        self::getSubscribedEvents()->shouldReturn([
            KernelEvents::TERMINATE => ['onKernelTerminate', 10]
        ]);
    }

    public function it_publish_a_message(Publisher $publisher, Event $event, User $author)
    {
        $event->getId()->willReturn('event1');
        $event->getAuthor()->willReturn($author);
        $event->getProjects()->willReturn(new ArrayCollection([]));

        $message = new Message(
            json_encode([
                'class' => \get_class($event->getWrappedObject()),
                'id' => 'event1'
            ])
        );
        $this->addToMessageStack($message);
        $this->onKernelTerminate();

        $publisher
            ->publish('elasticsearch.indexation', Argument::exact($message))
            ->shouldBeCalledOnce();
    }
}
