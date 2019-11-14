<?php

namespace Capco\AppBundle\Traits;

/**
 * @deprecated
 * 
 * This trait adds every methods required by SonataTranslatableInterface.
 */
trait SonataTranslatableTrait
{
    public function setLocale(string $locale): self
    {
        $this->setCurrentLocale($locale);

        return $this;
    }

    public function getLocale(): string 
    {
        return $this->getCurrentLocale();
    }
}
