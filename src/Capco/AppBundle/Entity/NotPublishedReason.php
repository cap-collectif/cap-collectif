<?php
namespace Capco\AppBundle\Entity;

final class NotPublishedReason
{
    public const WAITING_AUTHOR_CONFIRMATION = "WAITING_AUTHOR_CONFIRMATION";
    public const AUTHOR_NOT_CONFIRMED = "AUTHOR_NOT_CONFIRMED";
    public const ACCOUNT_CONFIRMED_TOO_LATE = "ACCOUNT_CONFIRMED_TOO_LATE";
}
