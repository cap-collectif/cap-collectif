<?php

namespace Capco\AppBundle\Entity\Interfaces;

interface FollowerNotifiedOfInterface
{
    public const MINIMAL = 'MINIMAL';
    public const ESSENTIAL = 'ESSENTIAL';
    public const ALL = 'ALL';
    public const NOTIFICATIONS = [self::MINIMAL, self::ESSENTIAL, self::ALL];
}
