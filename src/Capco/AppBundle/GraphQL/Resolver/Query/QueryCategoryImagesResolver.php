<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\CategoryImageRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryCategoryImagesResolver implements QueryInterface
{
    public function __construct(private readonly CategoryImageRepository $repository)
    {
    }

    public function __invoke(Arg $args): array
    {
        if ($args->offsetExists('isDefault')) {
            return $this->repository->findByisDefault($args->offsetGet('isDefault'));
        }

        return $this->repository->findAll();
    }
}
