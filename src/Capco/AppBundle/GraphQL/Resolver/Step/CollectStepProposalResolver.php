<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\Resolver\ProposalForm\ProposalFormProposalsResolver;

class CollectStepProposalResolver implements ResolverInterface
{
    private $resolver;

    public function __construct(ProposalFormProposalsResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function __invoke(
        CollectStep $collectStep,
        Argument $args,
        $user,
        RequestStack $request
    ): Promise {
        return $this->resolver->__invoke($collectStep->getProposalForm(), $args, $user, $request);
    }
}
