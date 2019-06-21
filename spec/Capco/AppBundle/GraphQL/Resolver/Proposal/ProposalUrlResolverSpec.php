<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver\Proposal;

use PhpSpec\ObjectBehavior;
use Capco\AppBundle\Entity\Proposal;
use Symfony\Component\Routing\RouterInterface;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;

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

    public function it_return_empty_with_no_proposal_step(Proposal $proposal): void
    {
        $proposal->getStep()->willReturn(null);
        $this->__invoke($proposal)->shouldReturn('');
    }
}
