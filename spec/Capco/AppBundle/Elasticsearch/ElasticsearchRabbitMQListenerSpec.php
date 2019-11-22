<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Elasticsearch\ElasticsearchRabbitMQListener;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class ElasticsearchRabbitMQListenerSpec extends ObjectBehavior
{
    public function let(Publisher $publisher, LoggerInterface $logger)
    {
        $this->beConstructedWith($publisher, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ElasticsearchRabbitMQListener::class);
    }

    public function it_subscribe_events()
    {
        $this::getSubscribedEvents()->shouldReturn(
            ElasticsearchRabbitMQListener::getSubscribedEvents()
        );
    }

    public function it_publish_a_message(
        Publisher $publisher,
        Event $event,
        User $author,
        Proposal $proposal
    ) {
        $event->getId()->willReturn('event1');
        $event->getAuthor()->willReturn($author);
        $event->getProjects()->willReturn(new ArrayCollection([]));

        $proposal->getId()->willReturn('proposal1');
        $proposal->getAuthor()->willReturn($author);
        $proposal->getComments()->willReturn(new ArrayCollection());
        $proposal->getCollectVotes()->willReturn(new ArrayCollection());
        $proposal->getSelectionVotes()->willReturn(new ArrayCollection());

        $messageEvent = new Message(
            json_encode([
                'class' => \get_class($event->getWrappedObject()),
                'id' => 'event1'
            ])
        );

        $messageProposal = new Message(
            json_encode([
                'class' => \get_class($proposal->getWrappedObject()),
                'id' => 'proposal1'
            ])
        );
        $this->addToMessageStack($messageProposal, 6);
        $this->addToMessageStack($messageEvent, 5);
        $this->getMessageStack()->shouldReturn([
            ['message' => $messageProposal, 'priority' => 6],
            ['message' => $messageEvent, 'priority' => 5]
        ]);
        $this->onKernelTerminate();

        $publisher->publish('elasticsearch.indexation', $messageEvent)->shouldBeCalledOnce();
        $publisher->publish('elasticsearch.indexation', $messageProposal)->shouldBeCalledOnce();
    }
}
