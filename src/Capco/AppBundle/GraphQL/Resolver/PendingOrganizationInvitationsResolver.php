<?php
namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class PendingOrganizationInvitationsResolver implements ResolverInterface
{
    private PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository;

    public function __construct(PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository)
    {
        $this->pendingOrganizationInvitationRepository = $pendingOrganizationInvitationRepository;
    }

    public function __invoke(Organization $organization, Argument $args = null): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($organization) {
            return $this->pendingOrganizationInvitationRepository->findPaginatedByOrganization(
                $organization,
                $limit,
                $offset
            );
        });

        $totalCount = $this->pendingOrganizationInvitationRepository->countByOrganization($organization);

        return $paginator->auto($args, $totalCount);
    }
}