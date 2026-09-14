<?php

namespace Capco\AppBundle\GraphQL\Resolver\FooterSocialNetwork;

use Capco\AppBundle\Repository\FooterSocialNetworkRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class FooterSocialNetworksAdminResolver implements QueryInterface
{
    public function __construct(
        private readonly FooterSocialNetworkRepository $footerSocialNetworkRepository
    ) {
    }

    public function __invoke(Argument $args): Connection
    {
        $totalCount = $this->footerSocialNetworkRepository->countAll();
        $paginator = new Paginator(
            fn (?int $offset = null, ?int $limit = null) => $this->footerSocialNetworkRepository->getWithPagination(
                $offset,
                $limit
            )
        );

        $connection = $paginator->auto($args, $totalCount);
        if (!$connection instanceof Connection) {
            throw new \RuntimeException('Unexpected Promise result while resolving footer social networks.');
        }

        return $connection;
    }
}
