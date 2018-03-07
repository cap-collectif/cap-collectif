<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Group;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class GroupResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve(string $groupId): Group
    {
        return $this->container->get('capco.group.repository')->find($groupId);
    }

    public function resolveAll(): array
    {
        return $this->container->get('capco.group.repository')->findAll();
    }

    public function resolveUsersConnection(Group $group, Argument $args): Connection
    {
        $userRepo = $this->container->get('capco.user.repository');

        $paginator = new Paginator(function (int $offset, int $limit) use ($userRepo, $group) {
            return $userRepo->getUsersInGroup($group);
        });

        $totalCount = $userRepo->countUsersInGroup($group);

        return $paginator->auto($args, $totalCount);
    }
}
