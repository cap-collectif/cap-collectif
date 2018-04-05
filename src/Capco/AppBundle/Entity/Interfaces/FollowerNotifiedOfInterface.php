<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface FollowerNotifiedOfInterface
{
    public const DEFAULT = '1';
    public const DEFAULT_AND_COMMENTS = '2';
    public const ALL = '3';
    public const NOTIFICATIONS = [self::DEFAULT, self::DEFAULT_AND_COMMENTS, self::ALL];
}
