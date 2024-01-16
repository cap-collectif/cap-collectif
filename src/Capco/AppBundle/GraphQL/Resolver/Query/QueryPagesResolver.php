<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryPagesResolver implements QueryInterface
{
    private $repository;

    public function __construct(PageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->getAll();
    }
}
