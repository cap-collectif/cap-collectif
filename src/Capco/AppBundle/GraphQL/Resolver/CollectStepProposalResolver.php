<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalFormResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class CollectStepProposalResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(ProposalFormResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(CollectStep $collectStep, Argument $args, $user, $request): Connection
    {
        return $this->resolver->resolveProposals($collectStep->getProposalForm(), $args, $user, $request);
    }
}
