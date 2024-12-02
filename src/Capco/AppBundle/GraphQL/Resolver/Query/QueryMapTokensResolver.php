<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\MapTokenRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryMapTokensResolver implements QueryInterface
{
    public function __construct(private readonly MapTokenRepository $repository)
    {
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
