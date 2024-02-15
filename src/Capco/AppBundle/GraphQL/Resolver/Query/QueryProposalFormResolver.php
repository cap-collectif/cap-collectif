<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryProposalFormResolver implements QueryInterface
{
    private ProposalFormRepository $repository;

    public function __construct(ProposalFormRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $argument): array
    {
        $query = $argument->offsetGet('query');
        if (!$query) {
            return $this->repository->findAll();
        }

        return $this->repository->searchByTerm($query);
    }
}
