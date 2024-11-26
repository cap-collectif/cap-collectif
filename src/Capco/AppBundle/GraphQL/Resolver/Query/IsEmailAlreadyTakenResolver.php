<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class IsEmailAlreadyTakenResolver implements QueryInterface
{
    private readonly UserRepository $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): bool
    {
        return null !== $this->repository->findOneByEmail($args->offsetGet('email'));
    }
}
