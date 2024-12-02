<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class CollectStepProposalResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private readonly ProposalFormProposalsDataLoader $dataLoader)
    {
    }

    public function __invoke(
        CollectStep $collectStep,
        Argument $args,
        $viewer,
        RequestStack $request
    ) {
        /*: Promise or Connection */ $this->protectArguments($args);
        $form = $collectStep->getProposalForm();

        if (!$form) {
            return ConnectionBuilder::empty();
        }

        return $this->dataLoader->load(compact('form', 'args', 'viewer', 'request'));
    }
}
