<?php

namespace Capco\AppBundle\Model;

/**
 * Use this interface on the translation entity.
 *
 * Every fields will be translatable for each locale.
 */
interface Translation
{
    public static function getTranslatableEntityClass(): string;
}
