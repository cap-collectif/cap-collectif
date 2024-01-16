<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalCanContactAuthorResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal): bool
    {
        return $proposal->getProposalForm()->canContact();
    }
}
