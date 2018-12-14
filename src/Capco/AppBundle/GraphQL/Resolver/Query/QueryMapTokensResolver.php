<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\MapTokenRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryMapTokensResolver implements ResolverInterface
{
    private $repository;

    public function __construct(MapTokenRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
