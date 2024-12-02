<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryProposalFromSlugResolver implements QueryInterface
{
    public function __construct(private readonly ProposalRepository $repository)
    {
    }

    public function __invoke(Argument $args, $viewer): ?Proposal
    {
        $proposal = $this->repository->getOneBySlug($args->offsetGet('slug'));

        if (!$proposal) {
            return null;
        }

        if ($proposal->isDraft() && $proposal->getAuthor() !== $viewer) {
            return null;
        }

        if (!$proposal->viewerCanSee($viewer)) {
            return null;
        }

        return $proposal;
    }
}
