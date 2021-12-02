<?php

namespace Capco\AppBundle\DBAL\Enum;

class MailerType extends AbstractEnumType
{
    public const MAILJET = 'mailjet';
    public const MANDRILL = 'mandrill';
    public const SMTP = 'smtp';

    protected string $name = 'enum_mailer_type';
    protected array $values = [self::MAILJET, self::MANDRILL, self::SMTP];
}
