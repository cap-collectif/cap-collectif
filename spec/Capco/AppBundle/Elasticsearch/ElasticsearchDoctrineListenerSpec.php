<?php

namespace spec\Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Elasticsearch\ElasticsearchDoctrineListener;
use Capco\AppBundle\Elasticsearch\ElasticsearchRabbitMQListener;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\District\ProposalDistrict;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\EntityChangeSetResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;

class ElasticsearchDoctrineListenerSpec extends ObjectBehavior
{
    public function let(
        ElasticsearchRabbitMQListener $listener,
        LoggerInterface $logger,
        AbstractResponseRepository $responseRepository,
        ProposalRepository $proposalRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        OpinionRepository $opinionRepository,
        EntityChangeSetResolver $changeSetResolver
    ): void {
        $this->beConstructedWith(
            $listener,
            $logger,
            $responseRepository,
            $proposalRepository,
            $proposalSelectionVoteRepository,
            $proposalCollectVoteRepository,
            $opinionRepository,
            $changeSetResolver
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ElasticsearchDoctrineListener::class);
    }

    public function it_subscribe_events(): void
    {
        $this->getSubscribedEvents()->shouldReturn([
            Events::postPersist,
            Events::postUpdate,
            Events::preRemove,
        ]);
    }

    public function it_index_an_event(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Event $event,
        User $author
    ): void {
        $event->getId()->willReturn('event1');
        $event->getAuthor()->willReturn($author);
        $event->getProjects()->willReturn(new ArrayCollection([]));

        $args->getObject()->willReturn($event);
        $this->handleEvent($args);

        $message = new Message(
            json_encode([
                'class' => \get_class($event->getWrappedObject()),
                'id' => 'event1',
            ])
        );
        $listener->addToMessageStack($message, 1)->shouldBeCalledOnce();
    }

    public function it_index_a_reply(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Reply $reply,
        ValueResponse $response,
        User $author,
        AbstractResponseRepository $responseRepository
    ): void {
        $response->getId()->willReturn(10);
        $response->getValue()->willReturn('test');
        $response->getReply()->willReturn($reply);

        $author->getId()->willReturn('user1');

        $reply->getId()->willReturn('reply1');
        $reply->getAuthor()->willReturn($author);
        $responseRepository->getByReply($reply)->willReturn([$response]);
        $args->getObject()->willReturn($reply);
        $this->handleEvent($args);

        $replyMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($reply->getWrappedObject()),
                    'id' => 'reply1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );

        $userMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($author->getWrappedObject()),
                    'id' => 'user1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );

        $responseMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($response->getWrappedObject()),
                    'id' => '10',
                ],
                \JSON_THROW_ON_ERROR
            )
        );

        $listener->addToMessageStack($replyMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($userMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($responseMessage, 1)->shouldBeCalledOnce();
    }

    public function it_index_a_project(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        ProposalRepository $proposalRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        OpinionRepository $opinionRepository,
        EntityChangeSetResolver $changeSetResolver,
        Project $project,
        Proposal $proposal,
        Opinion $opinion
    ): void {
        $project->getId()->willReturn('project1');
        $project->getVisibility()->willReturn(1);
        $project->getTitle()->willReturn('La 7a hardcore.');

        $proposal->getId()->willReturn('proposal1');
        $proposal->getProject()->willReturn($project);
        $proposal->getComments()->willReturn(new ArrayCollection());

        $opinion->getId()->willReturn('opinion1');

        $entityChangeSet = [
            'visibility' => [
                0 => 1,
                1 => 2,
            ],
        ];

        $changeSetResolver->getEntityChangeSet($project)->willReturn($entityChangeSet);

        $proposalRepository->getProposalsByProject('project1', 200, 0)->willReturn([$proposal]);
        $proposalRepository->getProposalsByProject('project1', 200, 200)->willReturn([])->shouldBeCalledOnce();
        $proposalSelectionVoteRepository->getVotesForProposal($proposal, 200, 0)->willReturn([])->shouldBeCalledOnce();
        $proposalCollectVoteRepository->getVotesForProposal($proposal, 200, 0)->willReturn([])->shouldBeCalledOnce();
        $opinionRepository->getOpinionsByProject('project1', 200, 0)->willReturn([$opinion]);
        $opinionRepository->getOpinionsByProject('project1', 200, 200)->willReturn([])->shouldBeCalledOnce();
        $args->getObject()->willReturn($project);

        $this->handleEvent($args);

        $projectMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($project->getWrappedObject()),
                    'id' => 'project1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );
        $proposalMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($proposal->getWrappedObject()),
                    'id' => 'proposal1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );
        $opinionMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($opinion->getWrappedObject()),
                    'id' => 'opinion1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );

        $listener->addToMessageStack($projectMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($proposalMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($opinionMessage, 1)->shouldBeCalledOnce();
    }

    public function it_index_a_project_with_no_changes(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        ProposalRepository $proposalRepository,
        EntityChangeSetResolver $changeSetResolver,
        Project $project,
        Proposal $proposal
    ) {
        $project->getId()->willReturn('project1');
        $project->getVisibility()->willReturn(1);
        $project->getTitle()->willReturn('La 8c impossible.');

        $proposal->getId()->willReturn('proposal1');
        $proposal->getProject()->willReturn($project);
        $proposal->getSelectionVotes()->willReturn(new ArrayCollection());
        $proposal->getCollectVotes()->willReturn(new ArrayCollection());
        $proposal->getComments()->willReturn(new ArrayCollection());

        $entityChangeSet = [
            'title' => [
                0 => 'La 8c impossible.',
                1 => 'test1',
            ],
        ];

        $changeSetResolver->getEntityChangeSet($project)->willReturn($entityChangeSet);
        $args->getObject()->willReturn($project);
        $this->handleEvent($args);
        $projectMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($project->getWrappedObject()),
                    'id' => 'project1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );
        $proposalMessage = new Message(
            json_encode(
                [
                    'class' => \get_class($proposal->getWrappedObject()),
                    'id' => 'proposal1',
                ],
                \JSON_THROW_ON_ERROR
            )
        );

        $listener->addToMessageStack($projectMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($proposalMessage, 1)->shouldNotBeCalled();
    }

    public function it_index_a_proposal(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Proposal $proposal,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        User $author
    ): void {
        $proposal->getId()->willReturn('proposal1');
        $proposal->getAuthor()->willReturn($author);
        $proposal->getComments()->willReturn(new ArrayCollection());
        $proposalSelectionVoteRepository->getVotesForProposal($proposal, 200, 0)
            ->willReturn([])->shouldBeCalledOnce();
        $proposalCollectVoteRepository->getVotesForProposal($proposal, 200, 0)
            ->willReturn([])->shouldBeCalledOnce();

        $author->getId()->willReturn('user1');

        $args->getObject()->willReturn($proposal);
        $this->handleEvent($args);

        $proposalMessage = new Message(
            json_encode([
                'class' => \get_class($proposal->getWrappedObject()),
                'id' => 'proposal1',
            ])
        );
        $authorMessage = new Message(
            json_encode(['class' => \get_class($author->getWrappedObject()), 'id' => 'user1'])
        );

        $listener->addToMessageStack($proposalMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($authorMessage, 1)->shouldBeCalledOnce();
    }

    public function it_index_a_proposal_vote(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        ProposalCollectVote $vote,
        Proposal $proposal,
        User $voteAuthor
    ): void {
        $proposal->getId()->willReturn('proposal1');
        $proposal->getComments()->willReturn(new ArrayCollection());

        $voteAuthor->getId()->willReturn('user1');

        $vote->getId()->willReturn('proposalCollectVote1');
        $vote->getRelated()->willReturn($proposal);
        $vote->getAuthor()->willReturn($voteAuthor);
        $args->getObject()->willReturn($vote);
        $this->handleEvent($args);

        $proposalCollectVoteMessage = new Message(
            (string) json_encode([
                'class' => \get_class($vote->getWrappedObject()),
                'id' => 'proposalCollectVote1',
            ])
        );
        $proposalMessage = new Message(
            (string) json_encode([
                'class' => \get_class($proposal->getWrappedObject()),
                'id' => 'proposal1',
            ])
        );
        $voteAuthorMessage = new Message(
            (string) json_encode([
                'class' => \get_class($voteAuthor->getWrappedObject()),
                'id' => 'user1',
            ])
        );
        $listener->addToMessageStack($proposalMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($voteAuthorMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($proposalCollectVoteMessage, 1)->shouldBeCalledOnce();
    }

    public function it_index_a_comment(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        Comment $comment,
        Proposal $commentProposal,
        User $commentAuthor
    ): void {
        $commentMessage = new Message(
            (string) json_encode([
                'class' => \get_class($comment->getWrappedObject()),
                'id' => 'comment1',
            ])
        );
        $commentProposalMessage = new Message(
            (string) json_encode([
                'class' => \get_class($commentProposal->getWrappedObject()),
                'id' => 'proposal1',
            ])
        );
        $commentAuthorMessage = new Message(
            (string) json_encode([
                'class' => \get_class($commentAuthor->getWrappedObject()),
                'id' => 'user1',
            ])
        );

        $listener->addToMessageStack($commentMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($commentProposalMessage, 1)->shouldBeCalledOnce();
        $listener->addToMessageStack($commentAuthorMessage, 1)->shouldBeCalledOnce();

        $comment->getId()->willReturn('comment1');
        $commentProposal->getId()->willReturn('proposal1');

        $comment->getRelatedObject()->willReturn($commentProposal);

        $commentAuthor->getId()->willReturn('user1');
        $comment->getAuthor()->willReturn($commentAuthor);

        $args->getObject()->willReturn($comment);
        $this->handleEvent($args);
    }

    public function it_index_project_district(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        GlobalDistrict $projectDistrict
    ): void {
        $projectDistrict->getId()->willReturn('projectDistrict1');

        $args->getObject()->willReturn($projectDistrict);
        $this->handleEvent($args);

        $message = new Message(
            (string) json_encode([
                'class' => \get_class($projectDistrict->getWrappedObject()),
                'id' => 'projectDistrict1',
            ])
        );
        $listener->addToMessageStack($message, 1)->shouldBeCalledOnce();
    }

    public function it_index_proposal_district(
        ElasticsearchRabbitMQListener $listener,
        LifecycleEventArgs $args,
        ProposalDistrict $proposalDistrict
    ): void {
        $proposalDistrict->getId()->willReturn('proposalDistrict1');

        $args->getObject()->willReturn($proposalDistrict);
        $this->handleEvent($args);

        $message = new Message(
            (string) json_encode([
                'class' => \get_class($proposalDistrict->getWrappedObject()),
                'id' => 'proposalDistrict1',
            ])
        );
        $listener->addToMessageStack($message, 1)->shouldBeCalledOnce();
    }
}
