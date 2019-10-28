<?php

namespace Capco\AppBundle\DBAL\Enum;

class EnumSSOEnvironmentType extends AbstractEnumType
{
    public const NONE = 'NONE';
    public const TESTING = 'TESTING';
    public const PRODUCTION = 'PRODUCTION';

    protected $name = 'enum_sso_environment';
    protected $values = [self::TESTING, self::PRODUCTION, self::NONE];
}
