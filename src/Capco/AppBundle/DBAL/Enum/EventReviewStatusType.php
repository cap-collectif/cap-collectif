<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewStatusType extends AbstractEnumType
{
    public const APPROVED = 'approved';
    public const REFUSED = 'refused';
    public const AWAITING = 'awaiting';
    public const NONE = '';

    protected $name = 'enum_event_review_status';
    protected $values = [self::AWAITING, self::REFUSED, self::APPROVED, self::NONE];
}
