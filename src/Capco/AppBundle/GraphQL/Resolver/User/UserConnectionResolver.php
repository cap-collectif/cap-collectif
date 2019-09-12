<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Capco\UserBundle\Entity\User;
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

    public function __invoke(User $user, Argument $args, $viewer, ?ArrayObject $context)
    {
        $userId = $user->getId();
        $email = $args->offsetGet('email');
        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');

        if (!$aclDisabled) {
            $this->preventNullableViewer($viewer);
        }

        if (
            !$aclDisabled &&
            !$viewer->isAdmin() &&
            ((null !== $userId && $userId !== $viewer->getId()) ||
                (null !== $email && $email !== $viewer->getEmail()))
        ) {
            throw new UserWarning('Cannot call this resolver with this user.');
        }

        if (null !== $email) {
            $successfulOnly = true === $args->offsetGet('success');
            $paginator = new Paginator(function (int $offset, int $limit) use ($email, $successfulOnly) {
                return $this->userConnectionRepository->findAttemptByEmail(
                    $email,
                    $offset,
                    $limit,
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
