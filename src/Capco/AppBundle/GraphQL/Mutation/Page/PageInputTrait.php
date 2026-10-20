<?php

namespace Capco\AppBundle\GraphQL\Mutation\Page;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Enum\PageErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MediaRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

trait PageInputTrait
{
    /**
     * Every translation needs a title, and the default locale also needs a content: the public page
     * is not rendered without both.
     *
     * @param iterable<array{locale?: string, title?: string, body?: ?string, metaDescription?: ?string}> $translations
     */
    private function getTranslationsErrorCode(iterable $translations, string $defaultLocale): ?string
    {
        $defaultLocaleTranslation = null;
        foreach ($translations as $translation) {
            if ('' === trim((string) ($translation['title'] ?? ''))) {
                return PageErrorCode::TITLE_REQUIRED;
            }
            if (($translation['locale'] ?? null) === $defaultLocale) {
                $defaultLocaleTranslation = $translation;
            }
        }

        if (null === $defaultLocaleTranslation) {
            return PageErrorCode::TITLE_REQUIRED;
        }

        if (self::isBodyEmpty($defaultLocaleTranslation['body'] ?? null)) {
            return PageErrorCode::BODY_REQUIRED;
        }

        return null;
    }

    /**
     * @param iterable<array{locale?: string, title?: string, body?: ?string, metaDescription?: ?string}> $translations
     */
    private function applyTranslations(Page $page, iterable $translations): void
    {
        foreach ($translations as $translationInput) {
            $translation = $page->translate((string) $translationInput['locale'], false);
            $translation->setTitle(trim((string) $translationInput['title']));
            // The "body" column is NOT NULL with no default, so an empty content must be stored as ''.
            $translation->setBody($translationInput['body'] ?? '');
            // Sonata stripped the tags of the meta description, which is rendered as plain text.
            $metaDescription = trim(strip_tags((string) ($translationInput['metaDescription'] ?? '')));
            $translation->setMetaDescription('' === $metaDescription ? null : $metaDescription);
        }
        $page->mergeNewTranslations();
    }

    // Media ids are exposed raw (no Relay global id), so they are decoded here rather than going
    // through GlobalIdResolver::resolve(), which cannot look up a raw media id and would silently drop it.
    private function applyCoverAndCustomCode(Page $page, Argument $input, MediaRepository $mediaRepository): void
    {
        if ($input->offsetExists('cover')) {
            $coverId = $input->offsetGet('cover');
            $cover = $coverId ? $mediaRepository->find(GlobalIdResolver::getDecodedId((string) $coverId, true)) : null;
            if ($coverId && !$cover instanceof Media) {
                throw new UserError(sprintf('Unknown media with id: %s', $coverId));
            }
            $page->setCover($cover);
        }

        if ($input->offsetExists('customCode')) {
            $customCode = $input->offsetGet('customCode');
            $page->setCustomCode(null === $customCode || '' === trim((string) $customCode) ? null : (string) $customCode);
        }
    }

    private static function isBodyEmpty(?string $body): bool
    {
        // Media-only contents are not empty even though they have no text.
        return '' === trim(html_entity_decode(strip_tags((string) $body, '<img><iframe><video><audio>')), " \t\n\r\0\x0B\u{00A0}");
    }
}
