<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStepPaperVoteCounter;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalStepPaperVoteTotalCountResolver;
use Capco\AppBundle\Repository\ProposalStepPaperVoteCounterRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class ProposalStepPaperVoteTotalCountResolverSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalStepPaperVoteTotalCountResolver::class);
    }

    public function let(
        ProposalStepPaperVoteCounterRepository $repository,
        GlobalIdResolver $globalIdResolver
    ): void {
        $this->beConstructedWith($repository, $globalIdResolver);
    }

    public function it_should_return_zero(
        Proposal $proposal,
        Argument $args,
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AbstractStep $step
    ) {
        $viewer->isAdmin()->willReturn(false);
        $args->offsetGet('stepId')->willReturn('stepWithSecretBallot');
        $step->canResolverDisplayBallot($viewer)->willReturn(false);
        $globalIdResolver->resolve('stepWithSecretBallot', $viewer)->willReturn($step);

        $this->__invoke($proposal, $args, $viewer)->shouldReturn(0);
    }

    public function it_should_return_papers_votes_total_count(
        Proposal $proposal,
        Argument $args,
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AbstractStep $step,
        ProposalStepPaperVoteCounter $vote1,
        ProposalStepPaperVoteCounter $vote2,
        ProposalStepPaperVoteCounterRepository $repository
    ) {
        $viewer->isAdmin()->willReturn(false);
        $args->offsetGet('stepId')->willReturn('stepWithSecretBallot');
        $step->canResolverDisplayBallot($viewer)->willReturn(true);
        $globalIdResolver->resolve('stepWithSecretBallot', $viewer)->willReturn($step);

        $repository
            ->findBy(['proposal' => $proposal, 'step' => $step])
            ->willReturn([$vote1->getWrappedObject(), $vote2->getWrappedObject()])
        ;

        $vote1->getTotalCount()->willReturn(3);
        $vote2->getTotalCount()->willReturn(7);

        $this->__invoke($proposal, $args, $viewer)->shouldReturn(10);
    }
}
