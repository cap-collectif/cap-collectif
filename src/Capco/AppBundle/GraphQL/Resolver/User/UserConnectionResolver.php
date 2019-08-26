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

    public function __invoke($viewer, $user, Argument $args)
    {
        $email = null;

        if ($args->offsetGet('email')) {
            $email = $args->offsetGet('email');
        }

        $paginator = new Paginator(function () use ($email) {
            return $this->userConnectionRepository->findByEmail($email);
        });

        $totalCount = $this->userConnectionRepository->countByEmail($email);

        return $paginator->auto($args, $totalCount);
    }
}
