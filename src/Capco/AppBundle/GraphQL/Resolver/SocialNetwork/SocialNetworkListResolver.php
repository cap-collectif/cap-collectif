<?php

namespace Capco\AppBundle\GraphQL\Resolver\SocialNetwork;

use Capco\AppBundle\Repository\SocialNetworkRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class SocialNetworkListResolver implements QueryInterface
{
    public function __construct(
        private readonly SocialNetworkRepository $socialNetworkRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = $this->socialNetworkRepository->countAll();
        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->socialNetworkRepository->getPaginated(
                $offset,
                $limit
            )
        );

        $connection = $paginator->auto($args, $totalCount);
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving social networks.');
        }

        return $connection;
    }
}
