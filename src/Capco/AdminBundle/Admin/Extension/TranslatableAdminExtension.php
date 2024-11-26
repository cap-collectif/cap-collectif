<?php

namespace Capco\AdminBundle\Admin\Extension;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Sonata\AdminBundle\Admin\AbstractAdminExtension;
use Sonata\AdminBundle\Admin\AdminInterface;

/**
 * @deprecated
 *
 * Extends SonataAdmin to add locale switcher on translatable entities.
 * You can remove it once sonata admin is no more used.
 */
class TranslatableAdminExtension extends AbstractAdminExtension
{
    /**
     * Locale of the content currently edited.
     */
    final public const TRANSLATABLE_LOCALE_PARAMETER = 'tl';

    protected Manager $toggleManager;
    protected LocaleRepository $localeRepository;
    protected ?string $translatableLocale = null;

    public function __construct(Manager $toggleManager, LocaleRepository $localeRepository)
    {
        $this->toggleManager = $toggleManager;
        $this->localeRepository = $localeRepository;
    }

    public function getEnabledTranslationLocales(): array
    {
        $locales = $this->toggleManager->isActive('multilangue')
            ? $this->localeRepository->findBy(['enabled' => true, 'published' => true])
            : [$this->localeRepository->findDefaultLocale()];

        $localesAsArray = [];
        foreach ($locales as $locale) {
            $localesAsArray[] = [
                'id' => $locale->getId(),
                'code' => $locale->getCode(),
                'traductionKey' => $locale->getTraductionKey(),
            ];
        }

        return $localesAsArray;
    }

    public function alterNewInstance(AdminInterface $admin, object $object): void
    {
        $this->setLocale($admin, $object);
    }

    public function alterObject(AdminInterface $admin, object $object): void
    {
        $this->setLocale($admin, $object);
    }

    public function preUpdate(AdminInterface $admin, object $object): void
    {
        self::mergeNewTranslations($object);
    }

    public function prePersist(AdminInterface $admin, object $object): void
    {
        self::mergeNewTranslations($object);
    }

    public function getTranslatableLocale(AdminInterface $admin): string
    {
        if (null === $this->translatableLocale) {
            $this->translatableLocale =
                $this->getLocaleFromRequest($admin) ?? $this->getDefaultTranslationLocale($admin);
        }

        return $this->translatableLocale;
    }

    public function getPersistentParameters(AdminInterface $admin): array
    {
        return [self::TRANSLATABLE_LOCALE_PARAMETER => $this->getTranslatableLocale($admin)];
    }

    private function getDefaultTranslationLocale(AdminInterface $admin): string
    {
        if ($admin->hasRequest() && $admin->getRequest()->getLocale()) {
            return $admin->getRequest()->getLocale();
        }

        return $this->localeRepository->getDefaultCode();
    }

    private static function getLocaleFromRequest(AdminInterface $admin): ?string
    {
        return $admin->hasRequest()
            ? $admin->getRequest()->get(self::TRANSLATABLE_LOCALE_PARAMETER)
            : null;
    }

    private function setLocale(AdminInterface $admin, $object): void
    {
        if (method_exists($object, 'setLocale')) {
            $object->setLocale($this->getTranslatableLocale($admin));
        }
    }

    private static function mergeNewTranslations($object): void
    {
        self::checkMethodMergeNewTranslation($object);

        $object->mergeNewTranslations();
    }

    private static function checkMethodMergeNewTranslation($object): void
    {
        if (!method_exists($object, 'mergeNewTranslations')) {
            throw new \InvalidArgumentException(sprintf('The object passed to "%s()" method MUST be properly configured using' . ' "knplabs/doctrine-behaviors" in order to have a "mergeNewTranslations" method.', __METHOD__));
        }
    }
}
