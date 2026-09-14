<?php

namespace Capco\AppBundle\GraphQL\Resolver\SourceCategory;

use Capco\AppBundle\Repository\SourceCategoryRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SourceCategoryListResolver implements QueryInterface
{
    public function __construct(
        private readonly SourceCategoryRepository $repository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->repository->findAllPaginated($offset, $limit)
        );

        $totalCount = $this->repository->countAll();

        return $paginator->auto($args, $totalCount);
    }
}
