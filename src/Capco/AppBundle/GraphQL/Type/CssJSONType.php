<?php

namespace Capco\AppBundle\GraphQL\Type;

use GraphQL\Language\AST\StringValueNode;

class CssJSONType
{
    public static function serialize(string $value): string
    {
        return $value;
    }

    public static function parseValue(string $value): string
    {
        return $value;
    }

    public static function parseLiteral(StringValueNode $valueNode): string
    {
        return $valueNode->value;
    }
}
