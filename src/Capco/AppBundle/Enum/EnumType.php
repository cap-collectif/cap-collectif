<?php

namespace Capco\AppBundle\Enum;

interface EnumType
{
    public static function getAvailableTypes(): array;

    public static function getAvailableTypesToString(): string;
}
