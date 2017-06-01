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
        return new \DateTime($value);
    }

    public static function parseLiteral($valueNode): \DateTime
    {
        return new \DateTime($valueNode->value);
    }
}
