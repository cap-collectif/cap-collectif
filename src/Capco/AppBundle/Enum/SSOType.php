<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\DBAL\Enum\AbstractEnumType;

final class SSOType extends AbstractEnumType
{
    public const FRANCE_CONNECT = 'franceconnect';
    public const OAUTH2 = 'oauth2';
    public const FACEBOOK = 'facebook';
    public const SAML = 'saml';
    public const CAS = 'cas';

    protected string $name = 'enum_sso_type';

    protected array $values = [
        self::FRANCE_CONNECT,
        self::OAUTH2,
        self::FACEBOOK,
        self::SAML,
        self::CAS,
    ];
}
