<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\ProposalForm\ProposalFormProposalsResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Symfony\Component\HttpFoundation\RequestStack;

class CollectStepProposalResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(ProposalFormProposalsResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(CollectStep $collectStep, Argument $args, $user, RequestStack $request): Connection
    {
        return $this->resolver->__invoke($collectStep->getProposalForm(), $args, $user, $request);
    }
}
