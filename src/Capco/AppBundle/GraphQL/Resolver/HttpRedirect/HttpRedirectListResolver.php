<?php

namespace Capco\AppBundle\GraphQL\Resolver\HttpRedirect;

use Capco\AppBundle\Repository\HttpRedirectRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class HttpRedirectListResolver implements QueryInterface
{
    public function __construct(
        private readonly HttpRedirectRepository $httpRedirectRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = $this->httpRedirectRepository->countAll();
        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->httpRedirectRepository->getPaginated(
                $offset,
                $limit
            )
        );

        $connection = $paginator->auto($args, $totalCount);
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving http redirects.');
        }

        return $connection;
    }
}
