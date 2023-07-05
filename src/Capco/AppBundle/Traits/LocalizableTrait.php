<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Entity\Locale;
use Doctrine\ORM\Mapping as ORM;

trait LocalizableTrait
{
    /**
     * @var Locale
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Locale")
     * @ORM\JoinColumn(name="locale", referencedColumnName="id", nullable=true)
     */
    private $locale;

    public function getLocale(): ?Locale
    {
        return $this->locale;
    }

    public function getLocaleCode(): ?string
    {
        if (null === $this->locale) {
            return null;
        }

        return $this->locale->getCode();
    }

    public function setLocale(?Locale $locale)
    {
        $this->locale = $locale;

        return $this;
    }

    public function isLocalized(): bool
    {
        return null !== $this->locale;
    }

    public function matchLocale(?string $locale): bool
    {
        return null === $this->locale || null === $locale || $locale === $this->locale->getCode();
    }
}
