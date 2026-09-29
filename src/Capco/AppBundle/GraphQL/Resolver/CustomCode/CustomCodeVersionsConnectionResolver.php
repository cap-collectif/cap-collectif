<?php

namespace Capco\AppBundle\GraphQL\Resolver\CustomCode;

use Capco\AppBundle\Service\CustomCodeVersioningService;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class CustomCodeVersionsConnectionResolver implements QueryInterface
{
    public function __construct(private readonly CustomCodeVersioningService $customCodeVersioning)
    {
    }

    /**
     * @param array<string, mixed> $customCode
     */
    public function __invoke(array $customCode, Argument $args): ConnectionInterface|Promise
    {
        $keyname = $customCode['keyname'];
        $total = $customCode['versionsCount'];
        $paginator = new Paginator(
            fn (int $offset, int $limit) => $this->customCodeVersioning->getVersionMetadataPage($keyname, $limit, $offset)
        );

        return $paginator->auto($args, $total);
    }
}
