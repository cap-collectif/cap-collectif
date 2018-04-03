<?php

namespace Capco\AppBundle\GraphQL\Type;

class IPType
{
    public static function serialize(string $value): ?string
    {
        return $value;
    }

    public static function parseValue(string $value): ?string
    {
        return $value;
    }

    public static function parseLiteral($valueNode): ?string
    {
        return $valueNode->value;
    }
}
