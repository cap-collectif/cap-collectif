<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\ThemeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryThemesResolver implements QueryInterface
{
    public function __construct(
        private readonly ThemeRepository $repository
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $title = $args->offsetGet('title');

        return $this->repository->findWithTitle($title);
    }
}
