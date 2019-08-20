<?php

namespace Capco\AppBundle\GraphQL;

use Overblog\GraphQLBundle\Relay\Connection\ConnectionBuilder as ParentBuilder;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

final class ConnectionBuilder
{
    public static function empty(array $extraFields = []): ConnectionInterface
    {
        $connectionBuilder = new ParentBuilder();
        $emptyConnection = $connectionBuilder->connectionFromArray([], new Argument([]));
        $emptyConnection->setTotalCount(0);

        foreach ($extraFields as $key => $value) {
            $emptyConnection->{$key} = $value;
        }

        return $emptyConnection;
    }

    public function connectionFromArray(array $array, ?Argument $args = null): ConnectionInterface
    {
        $connectionBuilder = new ParentBuilder();

        return $connectionBuilder->connectionFromArray($array, $args ? $args : []);
    }

    public static function offsetToCursor(int $offset): string
    {
        return base64_encode(ParentBuilder::PREFIX . $offset);
    }
}
