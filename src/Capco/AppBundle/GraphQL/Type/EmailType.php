<?php

namespace Capco\AppBundle\GraphQL\Type;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\RFCValidation;
use GraphQL\Error\Error;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Utils\Utils;
use Overblog\GraphQLBundle\Definition\Resolver\AliasedInterface;

class EmailType extends ScalarType implements AliasedInterface
{
    public $name = 'Email';

    public function serialize($value): string
    {
        return self::coerceEmail($value);
    }

    public function parseValue($value): string
    {
        return self::coerceEmail($value);
    }

    public function parseLiteral($valueNode, ?array $variables = null)
    {
        return self::coerceEmail($valueNode->value);
    }

    public static function getAliases(): array
    {
        return ['Email'];
    }

    private static function coerceEmail($value): string
    {
        // We return an empty string to trigger EMAIL_BLANK in mutation
        if (!$value) {
            return '';
        }

        if (!\is_string($value)) {
            throw new Error('Email cannot represent a non string value: ' . Utils::printSafe($value));
        }

        if (!(new EmailValidator())->isValid($value, new RFCValidation())) {
            return 'INVALID_EMAIL';
        }

        return (string) $value;
    }
}
