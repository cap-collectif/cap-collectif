<?php

namespace Capco\AppBundle\GraphQL\Type;

use DateTimeImmutable;

class TimeRangeType
{
    public static function serialize(array $value): array
    {
        return array_map(function (\DateTime $date) {
            return $date->format('Y-m-d H:i:s');
        }, $value);
    }

    public static function parseValue(array $value = null)
    {
        if (!$value) {
            return null;
        }

        return array_map(function (string $date) {
            return DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $date);
        }, $value);
    }

    public static function parseLiteral($valueNode): array
    {
        return array_map(function (string $date) {
            return DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $date);
        }, $valueNode->value);
    }
}
