<?php

namespace Capco\AppBundle\GraphQL\Mutation\Page;

use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Enum\PageErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\PageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class UpdatePageMutation implements MutationInterface
{
    use MutationTrait;
    use PageInputTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PageRepository $pageRepository,
        private readonly MediaRepository $mediaRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    /**
     * @return array{page: Page|null, errorCode: string|null}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $page = $this->pageRepository->find(GlobalIdResolver::getDecodedId((string) $input->offsetGet('id'), true));
        if (!$page instanceof Page) {
            return ['page' => null, 'errorCode' => PageErrorCode::NOT_FOUND];
        }

        $translations = $input->offsetGet('translations') ?? [];
        $errorCode = $this->getTranslationsErrorCode($translations, $this->localeRepository->getDefaultCode());
        if (null !== $errorCode) {
            return ['page' => null, 'errorCode' => $errorCode];
        }

        $this->applyTranslations($page, $translations);
        $this->removeTranslations($page, $input->offsetGet('deletedTranslationLocales') ?? [], $translations);
        $page->setIsEnabled((bool) ($input->offsetGet('isEnabled') ?? $page->getIsEnabled()));
        $this->applyCoverAndCustomCode($page, $input, $this->mediaRepository);
        // The "updatedAt" column has no Gedmo listener: only translation changes refreshed it so far.
        $page->setUpdatedAt(new \DateTime());

        $this->em->flush();

        return ['page' => $page, 'errorCode' => null];
    }

    /**
     * The default locale translation is required, and a locale sent in "translations" wins over its deletion.
     *
     * @param iterable<string>                 $deletedLocales
     * @param iterable<array{locale?: string}> $translations
     */
    private function removeTranslations(Page $page, iterable $deletedLocales, iterable $translations): void
    {
        $keptLocales = [$this->localeRepository->getDefaultCode()];
        foreach ($translations as $translation) {
            $keptLocales[] = $translation['locale'] ?? null;
        }

        foreach ($deletedLocales as $locale) {
            if (\in_array($locale, $keptLocales, true)) {
                continue;
            }
            foreach ($page->getTranslations() as $translation) {
                // The "translations" association has orphanRemoval: removing it from the collection deletes the row.
                if ($translation->getLocale() === $locale) {
                    $page->removeTranslation($translation);
                }
            }
        }
    }
}
