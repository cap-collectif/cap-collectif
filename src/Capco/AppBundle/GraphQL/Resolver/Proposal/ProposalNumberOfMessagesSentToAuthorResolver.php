<?php

declare(strict_types=1);

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalNumberOfMessagesSentToAuthorResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal): int
    {
        return $proposal->getStatistics() ? $proposal->getStatistics()->getNbrOfMessagesSentToAuthor() : 0;
    }
}
