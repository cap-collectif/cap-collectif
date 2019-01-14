<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use GraphQL\Executor\Promise\Promise;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\OrderDirection;
use Symfony\Component\HttpFoundation\RequestStack;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class ProposalFormProposalsResolver implements ResolverInterface
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
