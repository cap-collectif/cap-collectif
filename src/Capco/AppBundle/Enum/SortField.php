<?php

namespace Capco\AppBundle\Enum;

final class SortField
{
    public const CREATED_AT = 'CREATED_AT';
    public const UPDATED_AT = 'UPDATED_AT';

    public const SORT_FIELD = [
        self::CREATED_AT => 'createdAt',
        self::UPDATED_AT => 'updatedAt'
    ];
}
