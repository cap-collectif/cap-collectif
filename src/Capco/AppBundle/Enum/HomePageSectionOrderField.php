<?php

namespace Capco\AppBundle\Enum;

final class HomePageSectionOrderField
{
    public const POSITION = 'POSITION';
    public const CREATED_AT = 'CREATED_AT';
    public const UPDATED_AT = 'UPDATED_AT';

    public const SORT_FIELD = [
        self::POSITION => 'position',
        self::CREATED_AT => 'createdAt',
        self::UPDATED_AT => 'updatedAt',
    ];
}
