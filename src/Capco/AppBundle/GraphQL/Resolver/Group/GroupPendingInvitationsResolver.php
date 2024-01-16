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
    private UserInviteRepository $userInviteRepository;

    public function __construct(UserInviteRepository $userInviteRepository)
    {
        $this->userInviteRepository = $userInviteRepository;
    }

    public function __invoke(Group $group, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($group) {
            return $this->userInviteRepository->getPendingInvitations($limit, $offset, $group);
        });

        $totalCount = $group->getUserInvites()->count();

        return $paginator->auto($args, $totalCount);
    }
}
