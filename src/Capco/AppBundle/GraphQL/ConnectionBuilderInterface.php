<?php

namespace Capco\AppBundle\GraphQL;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\ArgumentInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

interface ConnectionBuilderInterface
{
    /**
     * @param mixed[] $extraFields
     */
    public static function empty(array $extraFields = []): ConnectionInterface;

    /**
     * @param ArgumentInterface[] $array
     */
    public function connectionFromArray(array $array, ?Argument $args = null): ConnectionInterface;

    public static function offsetToCursor(int $offset): string;
}
