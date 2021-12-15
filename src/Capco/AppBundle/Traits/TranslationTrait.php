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
    protected ?string $locale;

    /**
     * Will be mapped to translatable entity
     * by TranslatableSubscriber.
     */
    protected Translatable $translatable;

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

    public function doesTranslationExist(string $translation, $domain = 'CapcoAppBundle'): bool
    {
        $allTranslatableKeysFlipped = array_flip($this->getAllTranslationKey($domain));

        return isset($allTranslatableKeysFlipped[$translation]);
    }

    public function doesTranslationKeyExist(string $translation, $domain = 'CapcoAppBundle'): bool
    {
        $allTranslatableKeys = $this->getAllTranslationKey($domain);

        return isset($allTranslatableKeys[$translation]);
    }

    public function getAllTranslationKey($domain = 'CapcoAppBundle'): array
    {
        if (!property_exists($this, 'translator')) {
            return [];
        }

        $allTranslatableKeys = $this->translator->getCatalogue()->all();

        return $allTranslatableKeys[$domain];
    }
}
