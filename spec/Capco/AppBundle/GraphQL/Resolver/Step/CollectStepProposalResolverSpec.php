<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Step\CollectStepProposalResolver;
use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RequestStack;

class CollectStepProposalResolverSpec extends ObjectBehavior
{
    public function let(ProposalFormProposalsDataLoader $dataLoader)
    {
        $this->beConstructedWith($dataLoader);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(CollectStepProposalResolver::class);
    }

    public function it_resolve_empty_connection_when_no_form(
        CollectStep $step,
        RequestStack $request
    ): void {
        $args = new Argument(['first' => 10]);
        $step->getProposalForm()->willReturn(null);
        $this($step, $args, null, $request)->shouldReturnEmptyConnection();
    }
}
