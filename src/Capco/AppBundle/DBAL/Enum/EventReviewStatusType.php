<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewStatusType extends AbstractEnumType
{
    final public const APPROVED = 'approved';
    final public const REFUSED = 'refused';
    final public const AWAITING = 'awaiting';
    final public const NONE = '';
    final public const PUBLISHED = 'published';
    final public const NOT_PUBLISHED = 'not_published';
    final public const DELETED = 'deleted';
    public static $eventReviewStatus = [self::AWAITING, self::REFUSED, self::APPROVED];
    public static $eventStatusesLabels = [
        self::AWAITING => 'waiting',
        self::PUBLISHED => 'global.published',
        self::NOT_PUBLISHED => 'post_is_not_public',
        self::APPROVED => 'approved',
        self::REFUSED => 'global.declined',
        self::DELETED => 'global.deleted',
    ];

    protected string $name = 'enum_event_review_status';
    protected array $values = [self::AWAITING, self::REFUSED, self::APPROVED, self::NONE];
}
