<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ThemeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QueryThemesResolver implements ResolverInterface
{
    private ThemeRepository $repository;

    public function __construct(ThemeRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(Argument $args): array
    {
        $title = $args->offsetGet('title');

        return $this->repository->findWithTitle($title);
    }
}
