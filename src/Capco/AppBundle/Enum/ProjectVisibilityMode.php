<?php

namespace Capco\AppBundle\Enum;

use Capco\UserBundle\Entity\User;

final class ProjectVisibilityMode
{
    public const VISIBILITY_ME = 0;
    public const VISIBILITY_ADMIN = 1;
    public const VISIBILITY_PUBLIC = 2;
    public const VISIBILITY_CUSTOM = 3;

    public const VISIBILITY = [
        'myself' => self::VISIBILITY_ME,
        'private' => self::VISIBILITY_ADMIN,
        'public-everybody' => self::VISIBILITY_PUBLIC,
        'global.customized' => self::VISIBILITY_CUSTOM,
    ];

    public const VISIBILITY_WITH_HELP_TEXT = [
        'myself-visibility-only-me' => self::VISIBILITY_ME,
        'private-visibility-private' => self::VISIBILITY_ADMIN,
        'public-everybody' => self::VISIBILITY_PUBLIC,
        'global.customized' => self::VISIBILITY_CUSTOM,
    ];

    public const REVERSE_KEY_VISIBILITY = [
        self::VISIBILITY_ME => 'myself',
        self::VISIBILITY_ADMIN => 'private',
        self::VISIBILITY_PUBLIC => 'public-everybody',
        self::VISIBILITY_CUSTOM => 'global.customized',
    ];

    public static function getProjectVisibilityByRoles(User $user): array
    {
        $visibility = [];
        $visibility[] = self::VISIBILITY_PUBLIC;
        if ($user->isSuperAdmin()) {
            $visibility[] = self::VISIBILITY_ME;
            $visibility[] = self::VISIBILITY_ADMIN;
            $visibility[] = self::VISIBILITY_CUSTOM;
        } elseif ($user->isAdmin()) {
            $visibility[] = self::VISIBILITY_ADMIN;
        }

        return $visibility;
    }
}
