<?php

namespace Capco\AppBundle\GraphQL\Mutation\Theme;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Enum\ThemeErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

trait ThemeInputTrait
{
    /**
     * Column lengths of theme_translation, exceeding them would fail at flush time.
     *
     * @var array<string, int>
     */
    private static array $maxLengths = ['title' => 255, 'teaser' => 255, 'metaDescription' => 160];

    /**
     * @param iterable<array{locale?: string, title?: string, teaser?: ?string, body?: ?string, metaDescription?: ?string}> $translations
     *
     * @return null|string the error code, if any
     */
    private function validateTranslations(iterable $translations, string $defaultLocale): ?string
    {
        $hasDefaultLocaleTranslation = false;
        foreach ($translations as $translation) {
            $isDefaultLocale = ($translation['locale'] ?? null) === $defaultLocale;
            // A blank translation outside the default locale asks for that locale to be removed.
            if (!$isDefaultLocale && self::isBlankTranslation($translation)) {
                continue;
            }
            if ('' === trim((string) ($translation['title'] ?? ''))) {
                return ThemeErrorCode::TITLE_REQUIRED;
            }
            foreach (self::$maxLengths as $field => $maxLength) {
                if (mb_strlen(trim((string) ($translation[$field] ?? ''))) > $maxLength) {
                    return ThemeErrorCode::VALUE_TOO_LONG;
                }
            }
            if ($isDefaultLocale) {
                $hasDefaultLocaleTranslation = true;
            }
        }

        return $hasDefaultLocaleTranslation ? null : ThemeErrorCode::TITLE_REQUIRED;
    }

    /**
     * @param iterable<array{locale?: string, title?: string, teaser?: ?string, body?: ?string, metaDescription?: ?string}> $translations
     */
    private function applyTranslations(Theme $theme, iterable $translations): void
    {
        foreach ($translations as $translationInput) {
            $locale = (string) $translationInput['locale'];
            // Validation only lets a blank translation through outside the default locale.
            if (self::isBlankTranslation($translationInput)) {
                $existingTranslation = $theme->getTranslations()->get($locale);
                if ($existingTranslation) {
                    $theme->removeTranslation($existingTranslation);
                }

                continue;
            }
            $translation = $theme->translate($locale, false);
            $translation->setTitle(trim((string) $translationInput['title']));
            $translation->setTeaser(self::nullIfBlank($translationInput['teaser'] ?? null));
            $translation->setBody(self::nullIfBlank($translationInput['body'] ?? null));
            $translation->setMetaDescription(self::nullIfBlank($translationInput['metaDescription'] ?? null));
        }
        $theme->mergeNewTranslations();
    }

    private function applyFields(Theme $theme, Argument $input): void
    {
        $theme->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? $theme->getIsEnabled() ?? true));
        $theme->setPosition((int) ($input->offsetGet('position') ?? $theme->getPosition() ?? 0));
        // A null status means "no status", so only an absent field keeps the current one.
        if ($input->offsetExists('status')) {
            $theme->setStatus($input->offsetGet('status'));
        }
        if ($input->offsetExists('customCode')) {
            $theme->setCustomCode(self::nullIfBlank($input->offsetGet('customCode')));
        }
    }

    // Media ids are exposed raw (no Relay global id) while user ids are global ids, so both forms
    // are decoded here rather than going through GlobalIdResolver::resolve(), which cannot look up
    // a raw media id and would silently drop it.
    private function applyAuthorAndMedia(
        Theme $theme,
        Argument $input,
        UserRepository $userRepository,
        MediaRepository $mediaRepository
    ): void {
        if ($input->offsetExists('author')) {
            $authorId = $input->offsetGet('author');
            $author = $authorId ? $userRepository->find(GlobalIdResolver::getDecodedId((string) $authorId, true)) : null;
            if ($authorId && !$author instanceof User) {
                throw new UserError(sprintf('Unknown author with id: %s', $authorId));
            }
            $theme->setAuthor($author);
        }

        if ($input->offsetExists('media')) {
            $mediaId = $input->offsetGet('media');
            $media = $mediaId ? $mediaRepository->find(GlobalIdResolver::getDecodedId((string) $mediaId, true)) : null;
            if ($mediaId && !$media instanceof Media) {
                throw new UserError(sprintf('Unknown media with id: %s', $mediaId));
            }
            $theme->setMedia($media);
        }
    }

    /**
     * @param array{title?: string, teaser?: ?string, body?: ?string, metaDescription?: ?string} $translation
     */
    private static function isBlankTranslation(array $translation): bool
    {
        foreach (['title', 'teaser', 'body', 'metaDescription'] as $field) {
            if ('' !== trim((string) ($translation[$field] ?? ''))) {
                return false;
            }
        }

        return true;
    }

    // Values are stored trimmed, like the title, so that the length validated is the length stored.
    private static function nullIfBlank(?string $value): ?string
    {
        $value = null === $value ? '' : trim($value);

        return '' === $value ? null : $value;
    }
}
