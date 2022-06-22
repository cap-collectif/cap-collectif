<?php

namespace Capco\AppBundle\Traits;

trait TitleTranslatableTrait
{
    public function getTitle(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getTitle();
    }

    public function setTitle(string $title): self
    {
        $this->translate(null, false)->setTitle($title);

        return $this;
    }
}
