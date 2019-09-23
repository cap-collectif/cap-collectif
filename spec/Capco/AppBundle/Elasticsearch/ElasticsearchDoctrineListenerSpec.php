<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Elasticsearch\ElasticsearchRabbitMQListener;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Capco\AppBundle\Entity\Event;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Doctrine\Common\Persistence\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;
use Doctrine\Common\Collections\ArrayCollection;

class ElasticsearchDoctrineListenerSpec extends ObjectBehavior
{
    public function let(ElasticsearchRabbitMQListener $listener, LoggerInterface $logger)
    {
        $this->beConstructedWith($listener, $logger);
    }

    public function it_subscribe_events()
    {
        $this->getSubscribedEvents()->shouldReturn([
            Events::postPersist,
            Events::postUpdate,
            Events::preRemove
        ]);
    }

    public function it_index_an_event(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Event $event,
        User $author
    ) {
        $event->getId()->willReturn('event1');
        $event->getAuthor()->willReturn($author);
        $event->getProjects()->willReturn(new ArrayCollection([]));

        $message = new Message(
            json_encode([
                'class' => \get_class($event->getWrappedObject()),
                'id' => 'event1'
            ])
        );
        $listener->addToMessageStack($message)->shouldBeCalledOnce();

        $args->getObject()->willReturn($event);
        $this->handleEvent($args);
    }

    public function it_index_a_proposal(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Proposal $proposal,
        User $author,
        EntityManagerInterface $em
    ) {
        $proposalMessage = new Message(
            json_encode([
                'class' => \get_class($proposal->getWrappedObject()),
                'id' => 'proposal1'
            ])
        );
        $authorMessage = new Message(
            json_encode(['class' => \get_class($author->getWrappedObject()), 'id' => 'user1'])
        );
        $listener->addToMessageStack($proposalMessage)->shouldBeCalledOnce();
        $listener->addToMessageStack($authorMessage)->shouldBeCalledOnce();
        $proposal->getId()->willReturn('proposal1');
        $author->getId()->willReturn('user1');
        $proposal->getAuthor()->willReturn($author);
        $proposal->getComments()->willReturn(new ArrayCollection());
        $proposal->getCollectVotes()->willReturn(new ArrayCollection());
        $proposal->getSelectionVotes()->willReturn(new ArrayCollection());
        $args->getObject()->willReturn($proposal);
        $this->handleEvent($args);
    }

    public function it_index_a_proposal_vote(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        ProposalCollectVote $vote,
        Proposal $proposal,
        User $voteAuthor
    ) {
        $proposalCollectVoteMessage = new Message(
            json_encode([
                'class' => \get_class($vote->getWrappedObject()),
                'id' => 'proposalCollectVote1'
            ])
        );
        $proposalMessage = new Message(
            json_encode([
                'class' => \get_class($proposal->getWrappedObject()),
                'id' => 'proposal1'
            ])
        );
        $voteAuthorMessage = new Message(
            json_encode([
                'class' => \get_class($voteAuthor->getWrappedObject()),
                'id' => 'user1'
            ])
        );

        $listener->addToMessageStack($proposalCollectVoteMessage)->shouldBeCalledOnce();
        $listener->addToMessageStack($proposalMessage)->shouldBeCalledOnce();
        $listener->addToMessageStack($voteAuthorMessage)->shouldBeCalledOnce();
        $proposal->getId()->willReturn('proposal1');
        $voteAuthor->getId()->willReturn('user1');
        $proposal->getComments()->willReturn(new ArrayCollection());
        $vote->getId()->willReturn('proposalCollectVote1');
        $vote->getRelated()->willReturn($proposal);
        $vote->getAuthor()->willReturn($voteAuthor);
        $args->getObject()->willReturn($vote);
        $this->handleEvent($args);
    }

    public function it_index_a_comment(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Comment $comment,
        Proposal $commentProposal,
        User $commentAuthor
    ) {
        $commentMessage = new Message(
            json_encode([
                'class' => \get_class($comment->getWrappedObject()),
                'id' => 'comment1'
            ])
        );
        $commentProposalMessage = new Message(
            json_encode([
                'class' => \get_class($commentProposal->getWrappedObject()),
                'id' => 'proposal1'
            ])
        );
        $commentAuthorMessage = new Message(
            json_encode([
                'class' => \get_class($commentAuthor->getWrappedObject()),
                'id' => 'user1'
            ])
        );

        $listener->addToMessageStack($commentMessage)->shouldBeCalledOnce();
        $listener->addToMessageStack($commentProposalMessage)->shouldBeCalledOnce();
        $listener->addToMessageStack($commentAuthorMessage)->shouldBeCalledOnce();

        $comment->getId()->willReturn('comment1');
        $commentProposal->getId()->willReturn('proposal1');

        $comment->getRelatedObject()->willReturn($commentProposal);

        $commentAuthor->getId()->willReturn('user1');
        $comment->getAuthor()->willReturn($commentAuthor);

        $args->getObject()->willReturn($comment);
        $this->handleEvent($args);
    }
}
