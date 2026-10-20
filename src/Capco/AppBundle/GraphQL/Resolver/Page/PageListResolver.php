<?php

namespace Capco\AppBundle\GraphQL\Resolver\Page;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class PageListResolver implements QueryInterface
{
    public function __construct(
        private readonly PageRepository $pageRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $search = $args['search'] ?? null;
        $defaultLocale = $this->localeRepository->getDefaultCode();

        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->pageRepository
                ->getPaginated($defaultLocale, $search, $offset, $limit)
                ->getIterator()
                ->getArrayCopy()
        );

        $connection = $paginator->auto($args, $this->pageRepository->countAll($search));
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving custom pages.');
        }

        return $connection;
    }
}
