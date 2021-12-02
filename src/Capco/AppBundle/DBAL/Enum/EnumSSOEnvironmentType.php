<?php

namespace Capco\AppBundle\DBAL\Enum;

class EnumSSOEnvironmentType extends AbstractEnumType
{
    public const NONE = 'NONE';
    public const TESTING = 'TESTING';
    public const PRODUCTION = 'PRODUCTION';

    protected string $name = 'enum_sso_environment';
    protected array $values = [self::TESTING, self::PRODUCTION, self::NONE];
}
