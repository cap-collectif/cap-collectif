<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;

class ProposalUrlResolverSpec extends ObjectBehavior
{
    public function let(RouterInterface $router): void
    {
        $this->beConstructedWith($router);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ProposalUrlResolver::class);
    }

    public function it_return_empty_with_no_proposal_step(
        Proposal $proposal,
        RequestStack $requestStack
    ): void {
        $proposal->getStep()->willReturn(null);
        $this->__invoke($proposal, $requestStack)->shouldReturn('');
    }
}
