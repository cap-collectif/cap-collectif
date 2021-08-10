<?php

namespace Capco\AppBundle\Enum;

final class ProposalFormOrderField
{
    public const UPDATED_AT = 'UPDATED_AT';
    public const CREATED_AT = 'CREATED_AT';

    public const SORT_FIELD = [
        self::UPDATED_AT => 'updatedAt',
        self::CREATED_AT => 'createdAt',
    ];
}
