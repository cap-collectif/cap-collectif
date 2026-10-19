<?php

namespace Capco\AppBundle\GraphQL\Resolver\Theme;

use Capco\AppBundle\Repository\ThemeRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class ThemeListResolver implements QueryInterface
{
    public function __construct(
        private readonly ThemeRepository $themeRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;

        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->themeRepository
                ->getPaginated($search, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
        );

        $connection = $paginator->auto($args, $this->themeRepository->countPaginated($search));
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving themes.');
        }

        return $connection;
    }
}
