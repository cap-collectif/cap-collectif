<?php

namespace Capco\AppBundle\Enum;

final class ProjectOrderField
{
    public const POPULAR = 'POPULAR';
    public const PUBLISHED_AT = 'PUBLISHED_AT';

    public const MAP = [
        self::PUBLISHED_AT => 'publishedAt',
    ];
}
