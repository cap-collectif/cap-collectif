<?php

namespace Capco\AppBundle\GraphQL\Resolver\Dev;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

/**
 * Extends this abstract class to fake a paginated resolver with "random" data.
 */
abstract class AbstractFakePaginatedResolver extends AbstractFakeResolver
{
    /** Follow this example to extend : */

    /**
     * public function __invoke(Argument $args): ConnectionInterface
     * {
     * return $this->getPaginated(User::class, $args);
     * }.
     */
    protected function getPaginated(string $class, Argument $args): ConnectionInterface
    {
        $paginator = new Paginator(fn (int $offset, int $limit) => $this->getFromClass($class, $limit));

        return $paginator->auto($args, 42);
    }
}
