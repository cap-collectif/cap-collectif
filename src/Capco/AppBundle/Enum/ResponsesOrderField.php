<?php

namespace Capco\AppBundle\Enum;

final class ResponsesOrderField
{
    const CREATED_AT = 'CREATED_AT';
    const READABILITY = 'READABILITY';
    const CATEGORY = 'CATEGORY';

    const SORT_FIELD = [
        self::CREATED_AT => 'createdAt',
        self::READABILITY => 'iaReadability',
        self::CATEGORY => 'iaCategory',
    ];
}
