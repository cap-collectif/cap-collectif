<?php

namespace Capco\AppBundle\Enum;

final class ResponsesOrderField
{
    public const CREATED_AT = 'CREATED_AT';
    public const READABILITY = 'READABILITY';
    public const CATEGORY = 'CATEGORY';

    public const SORT_FIELD = [
        self::CREATED_AT => 'createdAt',
        self::READABILITY => 'iaReadability',
        self::CATEGORY => 'iaCategory',
    ];
}
