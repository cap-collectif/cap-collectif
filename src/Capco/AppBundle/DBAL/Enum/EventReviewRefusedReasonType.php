<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewRefusedReasonType extends AbstractEnumType
{
    public const SEX = 'sex';
    public const OFFENDING = 'offending';
    public const SPAM = 'spam';
    public const SYNTAX_ERROR = 'syntax_error';
    public const WRONG_CONTENT = 'wrong_content';
    public const OFF_TOPIC = 'off_topic';
    public const NONE = '';

    public static $refusedReasons = [
        self::SEX,
        self::OFFENDING,
        self::SPAM,
        self::SYNTAX_ERROR,
        self::WRONG_CONTENT,
        self::OFF_TOPIC
    ];

    public static $refusedReasonsLabels = [
        self::SEX => 'reporting.status.sexual',
        self::OFFENDING => 'reporting.status.offending',
        self::SPAM => 'reporting.status.spam',
        self::SYNTAX_ERROR => 'syntax-error',
        self::WRONG_CONTENT => 'reporting.status.error',
        self::OFF_TOPIC => 'reporting.status.off_topic'
    ];

    protected $name = 'enum_event_review_refused_reason';
    protected $values = [
        self::SEX,
        self::OFFENDING,
        self::SPAM,
        self::SYNTAX_ERROR,
        self::WRONG_CONTENT,
        self::OFF_TOPIC,
        self::NONE
    ];
}
