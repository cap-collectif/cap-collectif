<?php

namespace Capco\AppBundle\Traits;

use Capco\AppBundle\Model\TranslatableInterface;
use Capco\AppBundle\Model\TranslationInterface;

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
    protected TranslatableInterface $translatable;

    public function setTranslatable(TranslatableInterface $translatable): self
    {
        $this->translatable = $translatable;

        return $this;
    }

    public function getTranslatable(): TranslatableInterface
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

    // todo this method is used once and its behavior is weird, maybe rework this in the Translatable instead of the Translation
    public function setAsNewTranslation(TranslatableInterface $parent, TranslationInterface $translation): self
    {
        $parent->getNewTranslations()->set((string) $translation->getLocale(), $translation);
        $translation->setTranslatable($parent);

        return $this;
    }

    public function doesTranslationExist(string $translation, string $domain = 'CapcoAppBundle'): bool
    {
        $allTranslatableKeysFlipped = array_flip($this->getAllTranslationKey($domain));

        return isset($allTranslatableKeysFlipped[$translation]);
    }

    public function doesTranslationKeyExist(string $translation, string $domain = 'CapcoAppBundle'): bool
    {
        $allTranslatableKeys = $this->getAllTranslationKey($domain);

        return isset($allTranslatableKeys[$translation]);
    }

    public function getAllTranslationKey(string $domain = 'CapcoAppBundle'): array
    {
        if (!property_exists($this, 'translator')) {
            return [];
        }

        $allTranslatableKeys = $this->translator->getCatalogue()->all();

        return $allTranslatableKeys[$domain];
    }
}
