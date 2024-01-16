<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\Security\UserIdentificationCodeListRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserIdentificationCodeListResolver implements QueryInterface
{
    private UserIdentificationCodeListRepository $repo;

    public function __construct(UserIdentificationCodeListRepository $repo)
    {
        $this->repo = $repo;
    }

    public function __invoke(User $user, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(function () {
            return $this->repo->findAll();
        });

        return $paginator->auto($args, $this->repo->count([]));
    }
}
