<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Prophecy\Argument;
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
use Capco\AppBundle\GraphQL\Mutation\Debate\AddDebateVoteMutation;

class AddDebateVoteMutationSpec extends ObjectBehavior
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
        $this->shouldHaveType(AddDebateVoteMutation::class);
    }

    public function it_persist_new_vote(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        DebateVoteRepository $repository,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $repository
            ->getOneByDebateAndUser($debate, $viewer)
            ->willReturn(null)
            ->shouldBeCalled();

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $em->persist(Argument::type(DebateVote::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['previousVoteId']->shouldBe(null);
        $payload['debateVote']->shouldHaveType(DebateVote::class);
    }

    public function it_persists_new_vote_and_delete_previous(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        DebateVoteRepository $repository,
        DebateVote $debateVote,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $debateVote->getId()->willReturn('456');
        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn($debateVote);

        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $em->persist(Argument::type(DebateVote::class))->shouldBeCalled();
        $em->remove($debateVote)->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['previousVoteId']->shouldBe('RGViYXRlVm90ZTo0NTY=');
        $payload['debateVote']->shouldHaveType(DebateVote::class);
    }

    public function it_doesnt_persist_vote_when_closed(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $debate->viewerCanParticipate($viewer)->willReturn(false);

        $em->persist(Argument::type(DebateVote::class))->shouldNotBeCalled();
        $em->flush()->shouldNotBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe('CLOSED_DEBATE');
        $payload['previousVoteId']->shouldBe(null);
        $payload['debateVote']->shouldBe(null);
    }

    public function it_errors_on_invalid_id(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $globalIdResolver->resolve($debateId, $viewer)->willReturn(null);

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['previousVoteId']->shouldBe(null);
        $payload['errorCode']->shouldBe('UNKNOWN_DEBATE');
        $payload['debateVote']->shouldBe(null);
    }

    public function it_throws_exception_on_flush_error(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        Debate $debate,
        User $viewer,
        DebateVoteRepository $repository,
        DriverException $exception
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);
        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $em->persist(Argument::type(DebateVote::class))->shouldBeCalled();
        $em->flush()->willThrow($exception->getWrappedObject());

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
