<?php

namespace Capco\AppBundle\Entity;

final class ProjectVisibilityMode
{
    public const VISIBILITY_ME = 0;
    public const VISIBILITY_ADMIN = 1;
    public const VISIBILITY_PUBLIC = 2;

    public const VISIBILITY = [
        'myself' => self::VISIBILITY_ME,
        'private' => self::VISIBILITY_ADMIN,
        'public' => self::VISIBILITY_PUBLIC,
    ];
}