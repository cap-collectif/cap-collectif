<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryAvailableProposalFormsResolver implements ResolverInterface
{
    private $repository;

    public function __construct(ProposalFormRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(?string $term = null): array
    {
        if (null !== $term) {
            return $this->repository->searchByTerm($term);
        }

        return $this->repository->findBy(['step' => null]);
    }
}
