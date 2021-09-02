<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\DataLoader\User\UserArgumentsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ArgumentRepository;
use GraphQL\Executor\Promise\Promise;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class UserArgumentsResolver implements ResolverInterface
{
    use ResolverTrait;
    private $userArgumentsDataLoader;
    private $argumentRepository;
    private $promiseAdapter;

    public function __construct(
        UserArgumentsDataLoader $argumentsDataLoader,
        ArgumentRepository $argumentRepository,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->userArgumentsDataLoader = $argumentsDataLoader;
        $this->argumentRepository = $argumentRepository;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function getArgumentTotalCount(
        ?User $viewer,
        User $user,
        ?\ArrayObject $context = null
    ): int {
        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        return $aclDisabled
            ? $this->argumentRepository->countAllByUser($user)
            : $this->argumentRepository->countByUser($user, $viewer);
    }

    public function __invoke(
        ?User $viewer,
        User $user,
        ?Argument $args = null,
        ?\ArrayObject $context = null
    ): Promise {
        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');

        if (!$args) {
            $args = new Argument(['first' => 0]);
        }
        return $this->userArgumentsDataLoader->load(
            compact('viewer', 'user', 'args', 'aclDisabled')
        );
    }

    public function resolveSync(
        ?User $viewer,
        User $user,
        ?Argument $args = null,
        ?\ArrayObject $context = null
    ): Connection {
        $connection = null;
        $this->promiseAdapter->await(
            $this->__invoke($viewer, $user, $args, $context)->then(static function ($value) use (
                &$connection
            ) {
                $connection = $value;
            })
        );

        return $connection;
    }
}
