<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class GroupUsersResolver implements ResolverInterface
{
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function __invoke(Group $group, Argument $args): Connection
    {
        $paginator = new Paginator(function () use ($group) {
            return $this->userRepository->getUsersInGroup($group);
        });

        $totalCount = $this->userRepository->countUsersInGroup($group);

        return $paginator->auto($args, $totalCount);
    }
}
