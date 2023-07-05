<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\GraphQL\Mutation\Debate\RemoveDebateArgumentVoteMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentVoteRepository;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class RemoveDebateArgumentVoteMutationSpec extends ObjectBehavior
{
    public function let(
        DebateArgumentVoteRepository $repository,
        DebateAnonymousArgumentVoteRepository $anonymousRepository,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->beConstructedWith(
            $em,
            $globalIdResolver,
            $authorizationChecker,
            $repository,
            $anonymousRepository,
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RemoveDebateArgumentVoteMutation::class);
    }

    public function it_removes_vote(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        DebateArgumentVoteRepository $repository,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer,
        Arg $input,
        DebateArgument $debateArgument,
        DebateArgumentVote $debateArgumentVote,
        User $viewer
    ) {
        $debateArgumentId = 'debateArgumentId';
        $debateArgumentVoteId = 'debateArgumentVoteId';
        $input->offsetGet('debateArgumentId')->willReturn($debateArgumentId);
        $globalIdResolver->resolve($debateArgumentId, $viewer)->willReturn($debateArgument);
        $debateArgument->setVotes(new ArrayCollection([$debateArgument]));
        $debateArgument->isPublished()->willReturn(true);
        $debateArgumentVote->getId()->willReturn($debateArgumentVoteId);

        $authorizationChecker
            ->isGranted(DebateArgumentVoter::PARTICIPATE, $debateArgument)
            ->willReturn(true)
        ;

        $repository
            ->getOneByDebateArgumentAndUser($debateArgument, $viewer)
            ->willReturn($debateArgumentVote)
        ;

        $debateArgument->removeVote($debateArgumentVote)->shouldBeCalled();

        $indexer->remove(DebateArgumentVote::class, Argument::any())->shouldBeCalled();
        $em->remove($debateArgumentVote)->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['debateArgument']->shouldBe($debateArgument);
        $payload['deletedDebateArgumentVoteId']->shouldBe(
            'RGViYXRlQXJndW1lbnRWb3RlOmRlYmF0ZUFyZ3VtZW50Vm90ZUlk'
        );
    }

    public function it_fails_on_invalid_id(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        User $viewer
    ) {
        $id = 'wrongId';
        $input->offsetGet('debateArgumentId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn(null);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'UNKNOWN_DEBATE_ARGUMENT']);
    }

    public function it_fails_on_closed_debate(
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        Arg $input,
        DebateArgument $debateArgument,
        User $viewer
    ) {
        $id = 'debateArgumentId';
        $input->offsetGet('debateArgumentId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debateArgument);
        $debateArgument->isPublished()->willReturn(true);

        $authorizationChecker
            ->isGranted(DebateArgumentVoter::PARTICIPATE, $debateArgument)
            ->willReturn(false)
        ;

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'CLOSED_DEBATE']);
    }

    public function it_fails_if_not_voted(
        GlobalIdResolver $globalIdResolver,
        DebateArgumentVoteRepository $repository,
        AuthorizationCheckerInterface $authorizationChecker,
        Arg $input,
        DebateArgument $debateArgument,
        User $viewer
    ) {
        $id = 'debateArgumentId';
        $input->offsetGet('debateArgumentId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debateArgument);
        $debateArgument->isPublished()->willReturn(true);

        $authorizationChecker
            ->isGranted(DebateArgumentVoter::PARTICIPATE, $debateArgument)
            ->willReturn(true)
        ;

        $repository->getOneByDebateArgumentAndUser($debateArgument, $viewer)->willReturn(null);

        $this->__invoke($input, $viewer)->shouldBe(['errorCode' => 'NOT_VOTED']);
    }
}
