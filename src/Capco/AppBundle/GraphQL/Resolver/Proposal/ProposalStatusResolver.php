<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalStatusDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalStatusResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalStatusDataLoader $dataLoader
    ) {
    }

    public function __invoke(
        Proposal $proposal,
        Argument $args,
        $viewer,
        \ArrayObject $context
    ): Promise {
        return $this->dataLoader->load(compact('proposal', 'args', 'viewer', 'context'));
    }
}
