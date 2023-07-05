<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\OpinionTypeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class QueryOpinionTypeResolver implements ResolverInterface
{
    private $repository;

    public function __construct(OpinionTypeRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): array
    {
        $user = $args->offsetGet('user');

        if ($user) {
            return $this->repository->getByUser(GlobalId::fromGlobalId($user)['id']);
        }

        return $this->repository->findAll();
    }
}
