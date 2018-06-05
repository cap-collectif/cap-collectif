<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserReportsResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(User $user, Argument $args): Connection
    {
        $repo = $this->container->get('capco.reporting.repository');
        $paginator = new Paginator(function (int $offset, int $limit) use ($repo, $user) {
            return $repo->findBy(['Reporter' => $user]);
        });

        $totalCount = 0;

        return $paginator->auto($args, $totalCount);
    }
}
