<?php

namespace Capco\AppBundle\DBAL\Enum;

class EnumSSOEnvironmentType extends AbstractEnumType
{
    public const TESTING = 'testing';
    public const PRODUCTION = 'production';

    protected $name = 'enum_sso_environment';
    protected $values = [self::TESTING, self::PRODUCTION, ''];
}
