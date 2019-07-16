<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ThemeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryThemesResolver implements ResolverInterface
{
    private $repository;

    public function __construct(ThemeRepository $repository)
    {
        $this->repository = $repository;
    }

     public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
