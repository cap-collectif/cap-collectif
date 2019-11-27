<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewStatusType extends AbstractEnumType
{
    public const APPROVED = 'approved';
    public const REFUSED = 'refused';
    public const AWAITING = 'awaiting';
    public const NONE = '';
    public const PUBLISHED = 'published';
    public const NOT_PUBLISHED = 'not_published';
    public const DELETED = 'deleted';
    public static $eventReviewStatus = [self::AWAITING, self::REFUSED, self::APPROVED];
    public static $eventStatusesLabels = [
        self::AWAITING => 'waiting',
        self::PUBLISHED => 'global.published',
        self::NOT_PUBLISHED => 'post_is_not_public',
        self::APPROVED => 'approved',
        self::REFUSED => 'global.declined',
        self::DELETED => 'global.deleted'
    ];

    protected $name = 'enum_event_review_status';
    protected $values = [self::AWAITING, self::REFUSED, self::APPROVED, self::NONE];
}
