<?php

namespace Capco\AppBundle\GraphQL\Resolver\Group;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\UserBundle\Repository\UserRepository;
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
        return $this->container->get(GroupRepository::class)->findAll();
    }

    public function resolveUsersConnection(Group $group, Argument $args): Connection
    {
        $userRepo = $this->container->get(UserRepository::class);

        $paginator = new Paginator(function () use ($userRepo, $group) {
            return $userRepo->getUsersInGroup($group);
        });

        $totalCount = $userRepo->countUsersInGroup($group);

        return $paginator->auto($args, $totalCount);
    }
}
