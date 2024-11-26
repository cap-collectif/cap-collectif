<?php

namespace Capco\AppBundle\GraphQL\Resolver\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Repository\Organization\OrganizationMemberRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class OrganizationMembersResolver implements QueryInterface
{
    private readonly OrganizationMemberRepository $memberRepository;
    private readonly OrganizationAdminAccessResolver $organizationAdminAccessResolver;

    public function __construct(
        OrganizationAdminAccessResolver $organizationAdminAccessResolver,
        OrganizationMemberRepository $memberRepository
    ) {
        $this->memberRepository = $memberRepository;
        $this->organizationAdminAccessResolver = $organizationAdminAccessResolver;
    }

    public function __invoke(
        Organization $organization,
        ?User $viewer = null,
        ?Argument $args = null
    ): ConnectionInterface {
        $accessAllowed = $this->organizationAdminAccessResolver->__invoke($organization, $viewer);

        $paginator = new Paginator(function (int $offset, int $limit) use (
            $organization,
            $accessAllowed
        ) {
            if (!$accessAllowed) {
                return [];
            }

            return $this->memberRepository->findPaginatedByOrganization(
                $organization,
                $limit,
                $offset
            );
        });

        $totalCount = !$accessAllowed
            ? 0
            : $this->memberRepository->countByOrganization($organization);

        return $paginator->auto($args, $totalCount);
    }
}
