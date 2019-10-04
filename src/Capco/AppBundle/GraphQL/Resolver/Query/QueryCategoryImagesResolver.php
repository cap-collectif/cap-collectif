<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\CategoryImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryCategoryImagesResolver implements ResolverInterface
{
    private $repository;

    public function __construct(CategoryImageRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
