<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalLikersDataLoader;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalLikersResolver implements QueryInterface
{
    private $proposalLikersDataLoader;

    public function __construct(ProposalLikersDataLoader $proposalLikersDataLoader)
    {
        $this->proposalLikersDataLoader = $proposalLikersDataLoader;
    }

    public function __invoke(Proposal $proposal)
    {
        return $this->proposalLikersDataLoader->load(compact('proposal'));
    }
}
