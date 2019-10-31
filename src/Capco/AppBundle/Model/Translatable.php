<?php

namespace Capco\AppBundle\Model;

interface Translatable
{
    public static function getTranslationEntityClass(): string;
}
