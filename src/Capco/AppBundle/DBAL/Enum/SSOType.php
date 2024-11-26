<?php

namespace Capco\AppBundle\DBAL\Enum;

class SSOType extends AbstractEnumType
{
    final public const FRANCE_CONNECT = 'franceconnect';
    final public const OAUTH2 = 'oauth2';
    final public const FACEBOOK = 'facebook';
    final public const SAML = 'saml';
    final public const CAS = 'cas';
    final public const TWITTER = 'twitter';

    protected string $name = 'enum_sso_type';

    protected array $values = [
        self::FRANCE_CONNECT,
        self::OAUTH2,
        self::FACEBOOK,
        self::SAML,
        self::CAS,
        self::TWITTER,
    ];
}
