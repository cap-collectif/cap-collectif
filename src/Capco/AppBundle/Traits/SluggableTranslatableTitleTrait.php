<?php

namespace Capco\AppBundle\Traits;

trait SluggableTranslatableTitleTrait
{
    use TitleTranslatableTrait;

    public function getSlug(?string $locale = null, ?bool $fallbackToDefault = false): ?string
    {
        return $this->translate($locale, $fallbackToDefault)->getSlug();
    }

    public function setSlug(string $slug): self
    {
        $this->translate(null, false)->setSlug($slug);

        return $this;
    }
}
