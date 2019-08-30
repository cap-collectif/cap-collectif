<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\UserConnectionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserConnectionResolver implements ResolverInterface
{
    protected $userConnectionRepository;

    public function __construct(UserConnectionRepository $connectionRepository)
    {
        $this->userConnectionRepository = $connectionRepository;
    }

    public function __invoke(Argument $args, $viewer = null)
    {
        $userId = $args->offsetGet('userId');

        $paginator = new Paginator(function () use ($userId) {
            return $this->userConnectionRepository->findByUserId($userId);
        });

        $totalCount = $this->userConnectionRepository->countByUserId($userId);

        return $paginator->auto($args, $totalCount);
    }
}
