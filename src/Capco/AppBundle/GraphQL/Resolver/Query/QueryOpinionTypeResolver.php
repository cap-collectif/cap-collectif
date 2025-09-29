<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\OpinionTypeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class QueryOpinionTypeResolver implements QueryInterface
{
    public function __construct(
        private readonly OpinionTypeRepository $repository
    ) {
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
