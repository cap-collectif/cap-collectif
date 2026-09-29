<?php

namespace Capco\AppBundle\Enum;

final class NewsletterSubscriptionErrorCode
{
    final public const NOT_FOUND = 'NOT_FOUND';
    final public const INVALID_EMAIL = 'INVALID_EMAIL';
    final public const EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED';
}
