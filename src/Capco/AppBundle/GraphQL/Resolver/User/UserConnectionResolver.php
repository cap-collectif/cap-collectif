<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserWarning;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserConnectionResolver implements ResolverInterface
{
    use ResolverTrait;

    protected $userConnectionRepository;

    public function __construct(UserConnectionRepository $connectionRepository)
    {
        $this->userConnectionRepository = $connectionRepository;
    }

    public function __invoke(Argument $args, $viewer)
    {
        $this->preventNullableViewer($viewer);
        $userId = $args->offsetGet('userId');
        $email = $args->offsetGet('email');

        if (
            !$viewer->isAdmin() &&
            ((null !== $userId && $userId !== $viewer->getId()) ||
                (null !== $email && $email !== $viewer->getEmail()))
        ) {
            throw new UserWarning('Cannot call this resolver with this user.');
        }

        if (null !== $email) {
            $successfulOnly = true === $args->offsetGet('success');
            $paginator = new Paginator(function () use ($email, $successfulOnly) {
                return $this->userConnectionRepository->findAttemptByEmail(
                    $email,
                    $successfulOnly,
                    false
                );
            });

            $totalCount = $this->userConnectionRepository->countAttemptByEmail(
                $email,
                $successfulOnly,
                false
            );
        } else {
            $paginator = new Paginator(function () use ($userId) {
                return $this->userConnectionRepository->findByUserId($userId);
            });

            $totalCount = $this->userConnectionRepository->countByUserId($userId);
        }

        return $paginator->auto($args, $totalCount);
    }
}
