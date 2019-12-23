<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Locale;

trait LocaleRepositoryTrait
{
    protected function getLocale(?string $locale = null): string
    {
        return $locale ??
            $this->getEntityManager()
                ->getRepository(Locale::class)
                ->getDefaultCode();
    }
}
