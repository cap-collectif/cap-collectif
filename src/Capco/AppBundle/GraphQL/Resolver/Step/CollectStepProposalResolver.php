<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class CollectStepProposalResolver implements ResolverInterface
{
    use ResolverTrait;

    private $dataLoader;

    public function __construct(ProposalFormProposalsDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(
        CollectStep $collectStep,
        Argument $args,
        $viewer,
        RequestStack $request
    ): Promise {
        $this->protectArguments($args);
        $form = $collectStep->getProposalForm();

        return $this->dataLoader->load(compact('form', 'args', 'viewer', 'request'));
    }
}
