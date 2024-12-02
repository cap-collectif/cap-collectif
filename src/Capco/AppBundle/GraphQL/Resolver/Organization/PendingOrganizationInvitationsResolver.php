<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class PendingOrganizationInvitationsResolver implements QueryInterface
{
    public function __construct(private readonly PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository)
    {
    }

    public function __invoke(
        Organization $organization,
        ?Argument $args = null
    ): ConnectionInterface {
        $paginator = new Paginator(function (int $offset, int $limit) use ($organization) {
            return $this->pendingOrganizationInvitationRepository->findPaginatedByOrganization(
                $organization,
                $limit,
                $offset
            );
        });

        $totalCount = $this->pendingOrganizationInvitationRepository->countByOrganization(
            $organization
        );

        return $paginator->auto($args, $totalCount);
    }
}
