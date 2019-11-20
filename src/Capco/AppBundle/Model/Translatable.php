<?php

namespace Capco\AppBundle\Model;

/**
 * Use this interface to enable translating fields on an entity.
 *
 * Only not translated fields should be part of a Translatable.
 * Every translatable fields must be part of the Translation.
 */
interface Translatable
{
    public static function getTranslationEntityClass(): string;
}
