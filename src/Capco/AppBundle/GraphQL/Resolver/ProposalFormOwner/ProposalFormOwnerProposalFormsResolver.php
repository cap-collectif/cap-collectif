<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalFormOwner;

use Capco\AppBundle\Enum\ProposalFormOrderField;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ProposalFormOwnerProposalFormsResolver implements ResolverInterface
{
    private ProposalFormRepository $repository;

    public function __construct(ProposalFormRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args, User $viewer): ConnectionInterface
    {
        $query = $args->offsetGet('query');
        $orderByField = ProposalFormOrderField::SORT_FIELD[$args->offsetGet('orderBy')['field']];
        $orderByDirection = $args->offsetGet('orderBy')['direction'];
        $affiliations = $args->offsetGet('affiliations') ?? [];
        $availableOnly = $args->offsetGet('availableOnly');
        if (!$affiliations && !$viewer->isAdmin()) {
            throw new UserError('not admin');
        }

        $paginator = new Paginator(function (int $offset, ?int $limit) use (
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection,
            $viewer,
            $availableOnly
        ) {
            return $this->repository->getAll(
                $offset,
                $limit,
                $affiliations,
                $viewer,
                $query,
                $orderByField,
                $orderByDirection,
                $availableOnly
            );
        });

        $totalCount = $this->repository->countAll($affiliations, $viewer, $query, $availableOnly);

        return $paginator->auto($args, $totalCount);
    }
}
