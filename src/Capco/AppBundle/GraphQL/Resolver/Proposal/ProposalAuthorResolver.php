<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalAuthorResolver implements ResolverInterface
{
    protected $proposalAuthorDataLoader;

    public function __construct(ProposalAuthorDataLoader $proposalAuthorDataLoader)
    {
        $this->proposalAuthorDataLoader = $proposalAuthorDataLoader;
    }

    public function __invoke(Proposal $proposal): Promise
    {
        return $this->proposalAuthorDataLoader->load(compact('proposal'));
    }
}
