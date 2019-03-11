<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class GroupResolver implements ResolverInterface
{
    private $groupRepository;
    private $userRepository;

    public function __construct(GroupRepository $groupRepository, UserRepository $userRepository)
    {
        $this->groupRepository = $groupRepository;
        $this->userRepository = $userRepository;
    }

    public function resolveAll(): array
    {
        return $this->groupRepository->findAll();
    }

    public function resolveUsersConnection(Group $group, Argument $args): Connection
    {
        $paginator = new Paginator(function () use ($group) {
            return $this->userRepository->getUsersInGroup($group);
        });

        $totalCount = $this->userRepository->countUsersInGroup($group);

        return $paginator->auto($args, $totalCount);
    }
}
