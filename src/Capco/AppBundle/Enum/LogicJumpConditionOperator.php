<?php

namespace Capco\AppBundle\Enum;

class LogicJumpConditionOperator
{
    public const IS = 'IS';
    public const IS_NOT = 'IS_NOT';

    protected static $operatorName = [
        self::IS => 'logic-jump.is',
        self::IS_NOT => 'logic-jump.is_not'
    ];

    public static function getOperatorValue(string $operatorShortName): string
    {
        if (!isset(static::$operatorName[$operatorShortName])) {
            throw new \RuntimeException("Unknown operator '${operatorShortName}'");
        }

        return static::$operatorName[$operatorShortName];
    }

    public static function isOperatorValueValid(string $operatorShortName): bool
    {
        return isset(static::$operatorName[$operatorShortName]);
    }

    public static function getAvailableOperatorValues(): array
    {
        return [self::IS, self::IS_NOT];
    }

    public static function getAvailableOperatorValuesToString(): string
    {
        return implode(' | ', self::getAvailableOperatorValues());
    }
}
