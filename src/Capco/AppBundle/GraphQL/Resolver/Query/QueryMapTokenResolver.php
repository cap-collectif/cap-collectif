<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\MapToken;
use Capco\AppBundle\Repository\MapTokenRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryMapTokenResolver implements ResolverInterface
{
    private $repository;

    public function __construct(MapTokenRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): ?MapToken
    {
        $provider = $args->offsetGet('provider');

        return $this->repository->getCurrentMapTokenForProvider($provider);
    }
}
