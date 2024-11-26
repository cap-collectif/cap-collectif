<?php

namespace Capco\AppBundle\DBAL\Enum;

class EventReviewRefusedReasonType extends AbstractEnumType
{
    final public const SEX = 'sex';
    final public const OFFENDING = 'offending';
    final public const SPAM = 'spam';
    final public const SYNTAX_ERROR = 'syntax_error';
    final public const WRONG_CONTENT = 'wrong_content';
    final public const OFF_TOPIC = 'off_topic';
    final public const NONE = '';

    public static $refusedReasons = [
        self::SEX,
        self::OFFENDING,
        self::SPAM,
        self::SYNTAX_ERROR,
        self::WRONG_CONTENT,
        self::OFF_TOPIC,
    ];

    public static $refusedReasonsLabels = [
        self::SEX => 'reporting.status.sexual',
        self::OFFENDING => 'reporting.status.offending',
        self::SPAM => 'reporting.status.spam',
        self::SYNTAX_ERROR => 'syntax-error',
        self::WRONG_CONTENT => 'reporting.status.error',
        self::OFF_TOPIC => 'reporting.status.off_topic',
    ];

    protected string $name = 'enum_event_review_refused_reason';
    protected array $values = [
        self::SEX,
        self::OFFENDING,
        self::SPAM,
        self::SYNTAX_ERROR,
        self::WRONG_CONTENT,
        self::OFF_TOPIC,
        self::NONE,
    ];
}
