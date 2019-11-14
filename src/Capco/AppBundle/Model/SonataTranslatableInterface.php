<?php

namespace Capco\AppBundle\Model;

use Sonata\TranslationBundle\Model\TranslatableInterface;

/**
 * @deprecated
 * 
 * Use this interface to enable sonata automatic TranslationBundle.
 * You can remove it once, sonata is no more used for this entity.
 */
interface SonataTranslatableInterface
{
    public function setLocale(string $locale);
    public function getLocale(): string;
}
