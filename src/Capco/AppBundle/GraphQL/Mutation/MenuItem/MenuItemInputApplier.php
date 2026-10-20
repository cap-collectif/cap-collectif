<?php

namespace Capco\AppBundle\GraphQL\Mutation\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\MenuItemTranslation;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Enum\MenuItemErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\PageRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;

/**
 * Applies the fields shared by the createMenuItem and updateMenuItem mutations.
 */
class MenuItemInputApplier
{
    public function __construct(
        private readonly MenuItemRepository $menuItemRepository,
        private readonly PageRepository $pageRepository,
        private readonly LocaleRepository $localeRepository
    ) {
    }

    /**
     * @throws UserError with a MenuItemErrorCode as message
     */
    public function apply(MenuItem $menuItem, Argument $input): void
    {
        /** @var array<array{locale: string, title: string, link?: ?string}> $translations */
        $translations = $input->offsetGet('translations') ?? [];
        $defaultLocale = $this->localeRepository->getDefaultCode();
        if (!self::hasDefaultLocaleTitle($translations, $defaultLocale)) {
            throw new UserError(MenuItemErrorCode::TITLE_REQUIRED);
        }

        $menu = (int) $input->offsetGet('menu');
        $parent = $this->resolveParent($menuItem, $menu, $input->offsetGet('parent'));
        // The link (and so the page it may be computed from) of a mandatory item is locked
        $page = $menuItem->getIsFullyModifiable()
            ? $this->resolvePage($input->offsetGet('page'))
            : $menuItem->getPage();

        $isLinkEditable = null === $page && $menuItem->getIsFullyModifiable();
        // Validate every translation before changing the managed entity.
        if ($isLinkEditable) {
            foreach ($translations as $translationInput) {
                if ('' === trim((string) $translationInput['title']) && '' !== trim((string) ($translationInput['link'] ?? ''))) {
                    throw new UserError(MenuItemErrorCode::TITLE_REQUIRED);
                }
            }
        }

        $menuItem->setMenu($menu);
        $menuItem->setPosition((int) $input->offsetGet('position'));
        $menuItem->setIsEnabled((bool) $input->offsetGet('isEnabled'));
        $menuItem->setParent($parent);
        $menuItem->setPage($page);

        foreach ($translations as $translationInput) {
            $locale = (string) $translationInput['locale'];
            $title = trim((string) $translationInput['title']);
            if ('' === $title) {
                // An emptied title removes the translation of this (optional) locale
                $existingTranslation = $menuItem->getTranslations()->get($locale);
                if ($existingTranslation instanceof MenuItemTranslation) {
                    $menuItem->removeTranslation($existingTranslation);
                }

                continue;
            }

            /** @var MenuItemTranslation $translation */
            $translation = $menuItem->translate($locale, false);
            $translation->setTitle($title);
            $translation->setLink(
                $this->resolveLink($menuItem, $translation, $page, $translationInput['link'] ?? null, $defaultLocale)
            );
        }
        $menuItem->mergeNewTranslations();
        // Translations that were not submitted must also follow the page
        if (null !== $page) {
            foreach ($menuItem->getTranslations() as $translation) {
                $translation->setLink('pages/' . $page->getSlug($translation->getLocale(), true));
            }
        }

        $menuItem->setIsExternalLink(
            (bool) $input->offsetGet('isExternalLink') && null === $page && self::hasLink($menuItem)
        );
    }

    /**
     * The title is required in the platform default locale only.
     *
     * @param iterable<array{locale?: string, title?: string}> $translations
     */
    private static function hasDefaultLocaleTitle(iterable $translations, string $defaultLocale): bool
    {
        foreach ($translations as $translation) {
            if (($translation['locale'] ?? null) === $defaultLocale && '' !== trim((string) ($translation['title'] ?? ''))) {
                return true;
            }
        }

        return false;
    }

    private function resolveLink(
        MenuItem $menuItem,
        MenuItemTranslation $translation,
        ?Page $page,
        ?string $link,
        string $defaultLocale
    ): ?string {
        // Same link as the one Sonata stored for a page; the front-office resolves the page first anyway
        if (null !== $page) {
            return 'pages/' . $page->getSlug($translation->getLocale(), true);
        }

        if (!$menuItem->getIsFullyModifiable()) {
            $currentLink = $translation->getLink();
            if (null !== $currentLink && '' !== $currentLink) {
                return $currentLink;
            }

            // A new translation of a mandatory item inherits the default locale link, as in Sonata
            return $menuItem->translate($defaultLocale, false)->getLink();
        }

        $link = trim((string) $link);

        return '' === $link ? null : $link;
    }

    private function resolveParent(MenuItem $menuItem, int $menu, ?string $parentId): ?MenuItem
    {
        if (null === $parentId || '' === $parentId) {
            return null;
        }

        $parent = $this->menuItemRepository->find(GlobalIdResolver::getDecodedId($parentId, true));
        if (!$parent instanceof MenuItem || ($menuItem->getId() && $parent->getId() === $menuItem->getId())) {
            throw new UserError(MenuItemErrorCode::PARENT_NOT_FOUND);
        }

        // The navigation bar displays a single level of sub menus, and the footer none
        if (
            MenuItem::TYPE_HEADER !== $menu
            || !\in_array($parent, $this->menuItemRepository->getParentCandidates(), true)
            || $this->menuItemRepository->hasChildren($menuItem)
        ) {
            throw new UserError(MenuItemErrorCode::INVALID_PARENT);
        }

        return $parent;
    }

    private function resolvePage(?string $pageId): ?Page
    {
        if (null === $pageId || '' === $pageId) {
            return null;
        }

        $page = $this->pageRepository->find(GlobalIdResolver::getDecodedId($pageId, true));
        if (!$page instanceof Page) {
            throw new UserError(MenuItemErrorCode::PAGE_NOT_FOUND);
        }

        return $page;
    }

    private static function hasLink(MenuItem $menuItem): bool
    {
        foreach ($menuItem->getTranslations() as $translation) {
            if (null !== $translation->getLink() && '' !== $translation->getLink()) {
                return true;
            }
        }

        return false;
    }
}
