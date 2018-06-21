<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryProposalFormResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class CollectStepProposalResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(QueryProposalFormResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(CollectStep $collectStep, Argument $args, $user, $request): Connection
    {
        return $this->resolver->__invoke($collectStep->getProposalForm(), $args, $user, $request);
    }
}
