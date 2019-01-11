<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalStatusDataLoader;

class ProposalStatusResolver implements ResolverInterface
{
    private $dataloader;

    public function __construct(ProposalStatusDataLoader $dataloader)
    {
        $this->dataloader = $dataloader;
    }

    public function __invoke(Proposal $proposal, Argument $args): Promise
    {
        return $this->dataloader->load(compact('proposal', 'args'));
    }
}
