<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\GraphQL\Mutation\Debate\AddDebateArgumentVoteMutation;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Prophecy\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AddDebateArgumentVoteMutationSpec extends ObjectBehavior
{
    public function let(
        DebateArgumentVoteRepository $repository,
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
            $indexer
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AddDebateArgumentVoteMutation::class);
    }

    public function it_upvotes(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer,
        Arg $input,
        DebateArgument $debateArgument,
        User $viewer
    ) {
        $id = 'debateArgumentId';
        $input->offsetGet('debateArgumentId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn($debateArgument);
        $debateArgument->setVotes(new ArrayCollection());
        $debateArgument->isPublished()->willReturn(true);

        $authorizationChecker
            ->isGranted(DebateArgumentVoter::PARTICIPATE, $debateArgument)
            ->willReturn(true);

        $debateArgument->addVote(Argument::type(DebateArgumentVote::class))->shouldBeCalled();
        $em->persist(Argument::type(DebateArgumentVote::class))->shouldBeCalled();
        $em->flush()->shouldBeCalled();
        $indexer->index(DebateArgumentVote::class, Argument::any())->shouldBeCalled();
        $indexer->finishBulk()->shouldBeCalled();

        $payload = $this->__invoke($input, $viewer);
        $payload->shouldHaveCount(3);
        $payload['errorCode']->shouldBe(null);
        $payload['debateArgument']->shouldBe($debateArgument);
        $payload['debateArgumentVote']->getAuthor()->shouldBe($viewer);
        $payload['debateArgumentVote']->getDebateArgument()->shouldBe($debateArgument);
    }

    public function it_fails_on_invalid_id(
        GlobalIdResolver $globalIdResolver,
        Arg $input,
        User $viewer
    ) {
        $id = 'wrongId';
        $input->offsetGet('debateArgumentId')->willReturn($id);
        $globalIdResolver->resolve($id, $viewer)->willReturn(null);

        $this->__invoke($input, $viewer)->shouldBe([
            'errorCode' => 'UNKNOWN_DEBATE_ARGUMENT',
            'debateArgument' => null,
            'debateArgumentVote' => null,
        ]);
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
            ->willReturn(false);

        $this->__invoke($input, $viewer)->shouldBe([
            'errorCode' => 'CLOSED_DEBATE',
            'debateArgument' => null,
            'debateArgumentVote' => null,
        ]);
    }
}
