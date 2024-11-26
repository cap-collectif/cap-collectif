<?php

namespace Capco\AppBundle\DBAL\Enum;

class EnumSSOEnvironmentType extends AbstractEnumType
{
    final public const NONE = 'NONE';
    final public const TESTING = 'TESTING';
    final public const PRODUCTION = 'PRODUCTION';

    protected string $name = 'enum_sso_environment';
    protected array $values = [self::TESTING, self::PRODUCTION, self::NONE];
}
