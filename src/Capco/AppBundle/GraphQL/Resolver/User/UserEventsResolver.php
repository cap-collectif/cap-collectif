<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserEventsResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(User $user, Argument $args): Connection
    {
        $repo = $this->container->get('capco.event.repository');
        $paginator = new Paginator(function (int $offset, int $limit) use ($user, $repo) {
            return $repo->findBy(['Author' => $user]);
        });

        $totalCount = 0;

        return $paginator->auto($args, $totalCount);
    }
}
