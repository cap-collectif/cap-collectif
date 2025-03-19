<?php

namespace Capco\AppBundle\Model;

/**
 * Use this interface on the translation entity.
 *
 * Every fields will be translatable for each locale.
 */
interface TranslationInterface
{
    public static function getTranslatableEntityClass(): string;

    public function setTranslatable(TranslatableInterface $translatable): self;

    public function getTranslatable(): TranslatableInterface;

    public function setLocale(string $locale): self;

    public function getLocale(): ?string;

    public function isEmpty(): bool;
}
