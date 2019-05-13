<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalStatusDataLoader;

class ProposalStatusResolver implements ResolverInterface
{
    private $dataLoader;

    public function __construct(ProposalStatusDataLoader $dataLoader)
    {
        $this->dataLoader = $dataLoader;
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
