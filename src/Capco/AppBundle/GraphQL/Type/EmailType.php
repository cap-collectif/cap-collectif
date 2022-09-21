<?php

namespace Capco\AppBundle\GraphQL\Type;

use GraphQL\Error\Error;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Utils\Utils;
use Overblog\GraphQLBundle\Definition\Resolver\AliasedInterface;

class EmailType extends ScalarType implements AliasedInterface
{
    public $name = 'Email';

    public function serialize($value): string
    {
        if (!is_scalar($value)) {
            throw new Error('Email cannot represent non scalar value: ' . Utils::printSafe($value));
        }

        return self::coerceEmail($value);
    }

    public function parseValue($value): string
    {
        return self::coerceEmail($value);
    }

    public function parseLiteral($valueNode, ?array $variables = null)
    {
        if (false !== filter_var($valueNode->value, \FILTER_VALIDATE_EMAIL)) {
            return $valueNode->value;
        }

        throw new \Exception();
    }

    public static function getAliases(): array
    {
        return ['Email'];
    }

    private static function coerceEmail($value): string
    {
        // to trigger EMAIL_BLANK in mutation
        if (!$value) {
            return '';
        }
        if (false === filter_var($value, \FILTER_VALIDATE_EMAIL)) {
            throw new Error('Value : ' . Utils::printSafe($value) . ' is not valid');
        }

        if (\is_array($value)) {
            throw new Error('Email cannot represent an array value: ' . Utils::printSafe($value));
        }

        return (string) $value;
    }
}
