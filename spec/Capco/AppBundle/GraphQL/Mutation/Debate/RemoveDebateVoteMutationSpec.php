<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\Debate\Debate;
use Doctrine\DBAL\Driver\DriverException;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Mutation\Debate\RemoveDebateVoteMutation;

class RemoveDebateVoteMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        DebateVoteRepository $repository
    ) {
        $this->beConstructedWith($em, $logger, $globalIdResolver, $repository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RemoveDebateVoteMutation::class);
    }

    public function it_delete_an_vote_when_open(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateVote $debateVote,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $repository
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $debateVote->getId()->willReturn('456');
        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);

        $em->remove($debateVote)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['debate']->shouldBe($debate);
        $payload['deletedVoteId']->shouldBe('RGViYXRlVm90ZTo0NTY=');
    }

    public function it_errors_on_invalid_id(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
    }

    public function it_errors_if_not_voted(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $repository
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('NO_VOTE_FOUND');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
    }

    public function it_errors_on_closed_debate(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        DebateVote $debateVote,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $repository
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(false);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('CLOSED_DEBATE');
        $payload['debate']->shouldBe(null);
        $payload['deletedVoteId']->shouldBe(null);
    }

    public function it_throws_exception_on_flush_error(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $repository,
        DebateVote $debateVote,
        DriverException $exception
    ) {
        $id = '123';
        $input->offsetGet('debateId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $debateVote->getId()->willReturn('456');
        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);

        $em->remove($debateVote)->shouldBeCalled();
        $em->flush()->willThrow($exception->getWrappedObject());

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
