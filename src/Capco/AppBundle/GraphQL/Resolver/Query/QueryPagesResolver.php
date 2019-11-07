<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryPagesResolver implements ResolverInterface
{
    private $repository;

    public function __construct(PageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
