<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalVotesResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use PhpSpec\ObjectBehavior;

class ProposalVotesResolverSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(ProposalVotesResolver::class);
    }

    public function let(
        ProposalVotesDataLoader $proposalVotesDataLoader,
        GlobalIdResolver $globalIdResolver
    ): void {
        $this->beConstructedWith($proposalVotesDataLoader, $globalIdResolver);
    }

    public function it_should_return_empty_connection(
        Proposal $proposal,
        Argument $args,
        \ArrayObject $context,
        GlobalIdResolver $globalIdResolver,
        User $viewer,
        AbstractStep $step
    ) {
        $viewer->isAdmin()->willReturn(false);
        $args->offsetGet('includeNotAccounted')->willReturn(false);
        $args->offsetGet('includeUnpublished')->willReturn(false);
        $context->offsetExists('disable_acl')->willReturn(false);
        $context->offsetGet('disable_acl')->willReturn(false);
        $args->offsetExists('stepId')->willReturn(true);
        $args->offsetGet('stepId')->willReturn('stepWithSecretBallot');

        $step->canResolverDisplayBallot($viewer)->willReturn(false);
        $globalIdResolver->resolve('stepWithSecretBallot', $viewer, $context)->willReturn($step);

        $this->__invoke($proposal, $args, $context, $viewer)->shouldReturnEmptyConnection([
            'totalPointsCount' => 0,
        ]);
    }
}
