<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateVote;
use Capco\AppBundle\GraphQL\Mutation\Debate\AddDebateVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\DebateVoteRepository;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;

class AddDebateVoteMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        DebateVoteRepository $repository,
        Indexer $indexer,
        RequestGuesser $requestGuesser
    ) {
        $requestGuesser->getClientIp()->willReturn('1.2.3.4');
        $requestGuesser->getUserAgent()->willReturn('UserAgent');
        $this->beConstructedWith(
            $em,
            $logger,
            $globalIdResolver,
            $repository,
            $indexer,
            $requestGuesser
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddDebateVoteMutation::class);
    }

    public function it_persist_new_vote(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        DebateVoteRepository $repository,
        Indexer $indexer,
        Arg $input,
        Debate $debate,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input
            ->offsetGet('widgetOriginURI')
            ->shouldBeCalled()
            ->willReturn(null)
        ;
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $repository
            ->getOneByDebateAndUser($debate, $viewer)
            ->willReturn(null)
            ->shouldBeCalled()
        ;

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
        Indexer $indexer,
        User $viewer
    ) {
        $debateId = '123';
        $input->offsetGet('debateId')->willReturn($debateId);
        $input
            ->offsetGet('widgetOriginURI')
            ->shouldBeCalled()
            ->willReturn(null)
        ;
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
        $input->offsetGet('widgetOriginURI')->willReturn(null);
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
        $input->offsetGet('widgetOriginURI')->willReturn(null);
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
        $input->offsetGet('widgetOriginURI')->willReturn(null);
        $input->offsetGet('type')->willReturn('AGAINST');

        $globalIdResolver->resolve($debateId, $viewer)->willReturn($debate);

        $repository->getOneByDebateAndUser($debate, $viewer)->willReturn(null);
        $debate->viewerCanParticipate($viewer)->willReturn(true);

        $em->persist(Argument::type(DebateVote::class))->shouldBeCalled();
        $em->flush()->willThrow($exception->getWrappedObject());

        $this->shouldThrow(UserError::class)->during('__invoke', [$input, $viewer]);
    }
}
