<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ProposalFormProposalsResolver implements QueryInterface
{
    private $dataLoader;

    public function __construct(ProposalFormProposalsDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(ProposalForm $form, Arg $args, $viewer, RequestStack $request): Promise
    {
        return $this->dataLoader->load(compact('form', 'args', 'viewer', 'request'));
    }
}
