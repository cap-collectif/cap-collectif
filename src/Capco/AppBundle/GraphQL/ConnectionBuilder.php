<?php

namespace Capco\AppBundle\GraphQL;

use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder as ParentBuilder;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

final class ConnectionBuilder
{
    public static function empty(array $extraFields = []): Connection
    {
        $emptyConnection = ParentBuilder::connectionFromArray([], new Argument());
        $emptyConnection->totalCount = 0;

        foreach ($extraFields as $key => $value) {
            $emptyConnection->{$key} = $value;
        }

        return $emptyConnection;
    }

    public static function connectionFromArray(array $array, Argument $args): Connection
    {
        return ParentBuilder::connectionFromArray($array, $args);
    }
}
