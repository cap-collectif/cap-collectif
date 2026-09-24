<?php

namespace Capco\AppBundle\GraphQL\Mutation\Video;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

trait VideoTranslationsTrait
{
    /**
     * @param iterable<array{title?: string, body?: ?string, locale?: string}> $translations
     */
    private function hasValidTranslations(iterable $translations, string $defaultLocale): bool
    {
        $hasDefaultLocaleTranslation = false;
        foreach ($translations as $translation) {
            if ('' === trim((string) ($translation['title'] ?? ''))) {
                return false;
            }
            if (($translation['locale'] ?? null) === $defaultLocale) {
                $hasDefaultLocaleTranslation = true;
            }
        }

        return $hasDefaultLocaleTranslation;
    }

    /**
     * @param iterable<array{title?: string, body?: ?string, locale?: string}> $translations
     */
    private function applyTranslations(Video $video, iterable $translations): void
    {
        foreach ($translations as $translationInput) {
            $translation = $video->translate((string) $translationInput['locale'], false);
            $translation->setTitle(trim((string) $translationInput['title']));
            // The "body" column is NOT NULL with no default, so an empty description must be stored as ''.
            $translation->setBody($translationInput['body'] ?? '');
        }
        $video->mergeNewTranslations();
    }

    // Media ids are exposed raw (no Relay global id) while user ids are global ids, so both forms
    // are decoded here rather than going through GlobalIdResolver::resolve(), which cannot look up
    // a raw media id and would silently drop it.
    private function applyAuthorAndMedia(
        Video $video,
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
            $video->setAuthor($author);
        }

        if ($input->offsetExists('media')) {
            $mediaId = $input->offsetGet('media');
            $media = $mediaId ? $mediaRepository->find(GlobalIdResolver::getDecodedId((string) $mediaId, true)) : null;
            if ($mediaId && !$media instanceof Media) {
                throw new UserError(sprintf('Unknown media with id: %s', $mediaId));
            }
            $video->setMedia($media);
        }
    }
}
