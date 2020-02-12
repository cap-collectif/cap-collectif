<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Model\Translatable;
use Capco\AppBundle\Model\Translation;

/**
 * Translation trait.
 *
 * Should be used inside translation entity.
 */
trait TranslationTrait
{
    protected $locale;

    /**
     * Will be mapped to translatable entity
     * by TranslatableSubscriber.
     */
    protected $translatable;

    public function setTranslatable(Translatable $translatable): self
    {
        $this->translatable = $translatable;

        return $this;
    }

    public function setAsNewTranslation(Translatable $parent, Translation $translation)
    {
        $parent->getNewTranslations()->set((string) $translation->getLocale(), $translation);
        $translation->setTranslatable($parent);

        return $this;
    }

    public function getTranslatable(): Translatable
    {
        return $this->translatable;
    }

    public function setLocale(string $locale): self
    {
        $this->locale = $locale;

        return $this;
    }

    public function getLocale(): ?string
    {
        return $this->locale;
    }

    /**
     * Tells if translation is empty.
     */
    public function isEmpty(): bool
    {
        foreach (get_object_vars($this) as $var => $value) {
            if (\in_array($var, ['id', 'translatable', 'locale'])) {
                continue;
            }
            if (null !== $value) {
                return false;
            }
        }

        return true;
    }
}
