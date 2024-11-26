<?php

namespace Capco\AppBundle\DBAL\Enum;

class MailerType extends AbstractEnumType
{
    final public const MAILJET = 'mailjet';
    final public const MANDRILL = 'mandrill';
    final public const SMTP = 'smtp';

    protected string $name = 'enum_mailer_type';
    protected array $values = [self::MAILJET, self::MANDRILL, self::SMTP];
}
