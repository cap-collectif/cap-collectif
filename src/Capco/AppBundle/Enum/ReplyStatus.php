<?php

namespace Capco\AppBundle\Enum;

final class ReplyStatus
{
    public const PUBLISHED = 'PUBLISHED';
    public const NOT_PUBLISHED = 'NOT_PUBLISHED';
    public const DRAFT = 'DRAFT';
    public const PENDING = 'PENDING';

    public const DEFAULT_STATUSES = [
        self::PUBLISHED,
        self::PENDING,
        self::NOT_PUBLISHED,
        self::DRAFT,
    ];
}
