<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Mutation\Debate\RemoveDebateVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class RemoveDebateVoteMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        DebateVoteRepository $voteRepository,
        DebateArgumentRepository $argumentRepository,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $logger,
            $globalIdResolver,
            $voteRepository,
            $argumentRepository,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RemoveDebateVoteMutation::class);
    }

    public function it_delete_a_vote_when_open(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateVote $debateVote,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $voteRepository,
        DebateArgumentRepository $argumentRepository,
        Indexer $indexer
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $debateVote->getId()->willReturn('456');
        $voteRepository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);

        $argumentRepository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);

        $em->remove($debateVote)->shouldBeCalled();
        $indexer->remove(DebateVote::class, '456')->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(4);
        $payload['errorCode']->shouldBe(null);
        $payload['debate']->shouldBe($debate);
        $payload['deletedVoteId']->shouldBe('RGViYXRlVm90ZTo0NTY=');
        $payload['deletedArgumentId']->shouldBe(null);
    }

    public function it_delete_a_vote_and_argument_when_open(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateVote $debateVote,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $voteRepository,
        DebateArgumentRepository $argumentRepository,
        DebateArgument $debateArgument,
        Indexer $indexer
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $debateVote->getId()->willReturn('456');
        $voteRepository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);

        $debateArgument->getId()->willReturn('789');
        $argumentRepository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateArgument);

        $em->remove($debateArgument)->shouldBeCalled();
        $em->remove($debateVote)->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $indexer->remove(DebateArgument::class, '789')->shouldBeCalled();
        $indexer->remove(DebateVote::class, '456')->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(4);
        $payload['errorCode']->shouldBe(null);
        $payload['debate']->shouldBe($debate);
        $payload['deletedVoteId']->shouldBe('RGViYXRlVm90ZTo0NTY=');
        $payload['deletedArgumentId']->shouldBe('RGViYXRlQXJndW1lbnQ6Nzg5');
    }

    public function it_errors_on_invalid_id(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(4);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
        $payload['deletedArgumentId']->shouldBe(null);
    }

    public function it_errors_if_not_voted(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $voteRepository
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $voteRepository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(4);
        $payload['errorCode']->shouldBe('NO_VOTE_FOUND');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
        $payload['deletedArgumentId']->shouldBe(null);
    }

    public function it_errors_on_closed_debate(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateVote $debateVote,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $voteRepository
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(false);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(4);
        $payload['errorCode']->shouldBe('CLOSED_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
        $payload['deletedArgumentId']->shouldBe(null);
    }

    public function it_throws_exception_on_flush_error(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $voteRepository,
        DebateArgumentRepository $argumentRepository,
        DebateVote $debateVote,
        DriverException $exception
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $this->getMockedGraphQLArgumentFormatted($input);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $debateVote->getId()->willReturn('456');
        $voteRepository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);
        $argumentRepository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);

        $em->remove($debateVote)->shouldBeCalled();
        $em->flush()->willThrow($exception->getWrappedObject());

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
