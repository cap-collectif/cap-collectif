<?php

namespace Capco\AppBundle\Enum;

final class ConsultationOrderField
{
    public const UPDATED_AT = 'UPDATED_AT';
    public const CREATED_AT = 'CREATED_AT';
    public const POSITION = 'POSITION';

    public const SORT_FIELD = [
        self::UPDATED_AT => 'updatedAt',
        self::CREATED_AT => 'createdAt',
        self::POSITION => 'position',
    ];
}
