<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryPagesResolver implements QueryInterface
{
    public function __construct(private readonly PageRepository $repository)
    {
    }

    public function __invoke(): array
    {
        return $this->repository->getAll();
    }
}
