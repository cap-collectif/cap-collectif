<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserGroupsResolver implements QueryInterface
{
    public function __construct(protected UserGroupRepository $userGroupRepo, protected GroupRepository $groupRepo)
    {
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        $paginator = new Paginator(function () use ($user) {
            return $this->groupRepo->getGroupsByUser($user);
        });

        $totalCount = $this->userGroupRepo->countAllByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
