<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\UserInviteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class GroupPendingInvitationsResolver implements QueryInterface
{
    public function __construct(
        private readonly UserInviteRepository $userInviteRepository
    ) {
    }

    public function __invoke(Group $group, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->userInviteRepository->getPendingInvitations($limit, $offset, $group)
        );

        $totalCount = $group->getUserInvites()->count();

        return $paginator->auto($args, $totalCount);
    }
}
