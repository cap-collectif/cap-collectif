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

    public function resolveUsersConnection(Group $group, Argument $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($group, $args) {
            $repo = $this->container->get('capco.user.repository');

            return $repo->getUsersInGroup($group);
        });

        $connection = $paginator->forward($args);

        return $connection;
    }
}
