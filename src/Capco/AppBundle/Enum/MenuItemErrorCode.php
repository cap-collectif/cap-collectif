<?php

namespace Capco\AppBundle\Enum;

final class MenuItemErrorCode
{
    final public const NOT_FOUND = 'NOT_FOUND';
    final public const TITLE_REQUIRED = 'TITLE_REQUIRED';
    final public const PARENT_NOT_FOUND = 'PARENT_NOT_FOUND';
    final public const INVALID_PARENT = 'INVALID_PARENT';
    final public const PAGE_NOT_FOUND = 'PAGE_NOT_FOUND';
    final public const NOT_DELETABLE = 'NOT_DELETABLE';
}
