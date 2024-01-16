<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\Interfaces\Owner;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OwnerProposalFormResolver implements QueryInterface
{
    private ProposalFormRepository $repository;

    public function __construct(ProposalFormRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Owner $owner, Argument $args): ConnectionInterface
    {
        $query = $args->offsetGet('query');
        $availableOnly = $args->offsetGet('availableOnly');

        $options = [
            'query' => $query,
            'availableOnly' => $availableOnly,
        ];

        $paginator = new Paginator(function (int $offset, int $limit) use ($owner, $options) {
            return $this->repository->getByOwner($owner, $offset, $limit, $options);
        });

        return $paginator->auto($args, $this->repository->countByOwner($owner));
    }
}
