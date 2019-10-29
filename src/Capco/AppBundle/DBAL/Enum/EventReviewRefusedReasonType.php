<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewRefusedReasonType extends AbstractEnumType
{
    public const SEX = 'sex';
    public const OFFENDING = 'offending';
    public const SPAM = 'spam';
    public const ERROR = 'error';
    public const OFF_TOPIC = 'off_topic';
    public const NONE = '';

    protected $name = 'enum_event_review_refused_reason';
    protected $values = [
        self::SEX,
        self::OFFENDING,
        self::SPAM,
        self::ERROR,
        self::OFF_TOPIC,
        self::NONE
    ];
}
