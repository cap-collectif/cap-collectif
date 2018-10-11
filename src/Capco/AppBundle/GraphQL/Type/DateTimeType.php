<?php

namespace Capco\AppBundle\GraphQL\Type;

class DateTimeType
{
    public static function serialize(\DateTime $value): string
    {
        return $value->format('Y-m-d H:i:s');
    }

    public static function parseValue(string $value = null)
    {
        if (!$value) {
            return null;
        }

        // For now we return a string...
        // Because Symfony forms doesn't recognize DateTime wtf
        return $value;
    }

    public static function parseLiteral($valueNode): \DateTime
    {
        return \DateTime::createFromFormat('Y-m-d H:i:s', $valueNode->value);
    }
}
