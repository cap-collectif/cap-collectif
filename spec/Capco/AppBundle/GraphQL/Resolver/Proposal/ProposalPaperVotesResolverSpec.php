<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Interfaces\VotableStepInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalPaperVotesResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class ProposalPaperVotesResolverSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalPaperVotesResolver::class);
    }

    public function let(GlobalIdResolver $globalIdResolver): void
    {
        $this->beConstructedWith($globalIdResolver);
    }

    public function it_should_return_empty_collection(
        Proposal $proposal,
        Argument $args,
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        VotableStepInterface $step,
        ArrayCollection $emptyResponse
    ) {
        $viewer->isAdmin()->willReturn(false);
        $args->offsetGet('stepId')->willReturn('stepWithSecretBallot');
        $step->canResolverDisplayBallot($viewer)->willReturn(false);
        $globalIdResolver->resolve('stepWithSecretBallot', $viewer)->willReturn($step);

        $this->__invoke($proposal, $args, $viewer)->shouldReturnEmptyCollection();
    }

    public function it_should_return_papers_votes(
        Proposal $proposal,
        Argument $args,
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        VotableStepInterface $step,
        ArrayCollection $votes
    ) {
        $viewer->isAdmin()->willReturn(false);
        $args->offsetGet('stepId')->willReturn('stepWithSecretBallot');
        $step->canResolverDisplayBallot($viewer)->willReturn(true);
        $globalIdResolver->resolve('stepWithSecretBallot', $viewer)->willReturn($step);
        $proposal->getPaperVotes()->willReturn($votes);
        $this->__invoke($proposal, $args, $viewer)->shouldReturn($votes);
    }
}
