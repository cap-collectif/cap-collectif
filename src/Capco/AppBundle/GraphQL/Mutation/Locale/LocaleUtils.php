<?php

namespace Capco\AppBundle\GraphQL\Mutation\Locale;

class LocaleUtils
{
    /**
     * To be updated instead of removed and reinserted, locales must be indexed.
     */
    public static function indexTranslations(array &$values): void
    {
        foreach ($values['translations'] as $key => $translation) {
            if ($key !== $translation['locale']) {
                $values['translations'][$translation['locale']] = $translation;
                unset($values['translations'][$key]);
            }
        }
    }
}
