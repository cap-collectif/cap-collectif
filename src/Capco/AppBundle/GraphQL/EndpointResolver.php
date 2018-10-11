<?php

namespace Capco\AppBundle\GraphQL;

final class EndpointResolver
{
    public static function getByName(string $name): array
    {
        if ('default' === $name) {
            return ['graphql_endpoint'];
        }

        return ['graphql_multiple_endpoint', ['schemaName' => $name]];
    }
}
