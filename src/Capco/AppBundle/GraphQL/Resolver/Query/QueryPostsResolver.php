<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\PostRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryPostsResolver implements QueryInterface
{
    private PostRepository $repository;

    public function __construct(PostRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findBy([], ['createdAt' => 'ASC']);
    }
}
