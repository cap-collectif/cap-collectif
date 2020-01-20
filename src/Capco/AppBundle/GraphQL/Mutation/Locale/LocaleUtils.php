<?php


namespace Capco\AppBundle\GraphQL\Mutation\Locale;

class LocaleUtils
{
    /**
     * To be updated instead of removed and reinserted, locales must be indexed.
     */
    static public function indexTranslations(array &$values): void
    {
        foreach ($values['translations'] as $translation) {
            $values['translations'][$translation['locale']] = $translation;
        }
    }
}
