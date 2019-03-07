<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

class GroupResolver implements ContainerAwareInterface, ResolverInterface
{
    use ContainerAwareTrait;

    public function resolveAll(): array
    {
        return $this->container->get('capco.group.repository')->findAll();
    }

    public function resolveUsersConnection(Group $group, Argument $args): Connection
    {
        $userRepo = $this->container->get('capco.user.repository');

        $paginator = new Paginator(function () use ($userRepo, $group) {
            return $userRepo->getUsersInGroup($group);
        });

        $totalCount = $userRepo->countUsersInGroup($group);

        return $paginator->auto($args, $totalCount);
    }
}
