<?php

namespace Capco\AdminBundle\Admin\Extension;

use Capco\AppBundle\Toggle\Manager;
use Sonata\AdminBundle\Admin\AdminInterface;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Sonata\TranslationBundle\Checker\TranslatableChecker;
use Sonata\TranslationBundle\Admin\Extension\Knplabs\TranslatableAdminExtension as Base;

class TranslatableAdminExtension extends Base
{
    protected $toggleManager;
    protected $siteParamRepository;
    protected $localeRepository;

    public function __construct(TranslatableChecker $translatableChecker, Manager $toggleManager, SiteParameterRepository $siteParamRepository, LocaleRepository $localeRepository)
    {
        $this->translatableChecker = $translatableChecker;
        $this->toggleManager = $toggleManager;
        $this->siteParamRepository = $siteParamRepository;
        $this->localeRepository = $localeRepository;
    }

    /**
     * {@inheritdoc}
     */
    protected function getTranslationLocales(AdminInterface $admin): array
    {
        return $this->getEnabledTranslationLocales();
    }

    /**
     * {@inheritdoc}
     */
    protected function getDefaultTranslationLocale(AdminInterface $admin): string
    {
        if ($this->toggleManager->isActive('unstable__multilangue')) {
            if ($admin->hasRequest() && $admin->getRequest()->getLocale()) {
                return $admin->getRequest()->getLocale();
            }
            return $this->localeRepository->getDefaultCode();
        }

        return $this->siteParamRepository->findOneByKeyname('global.locale')->getValue();
    }

    public function getEnabledTranslationLocales(): array {
        if ($this->toggleManager->isActive('unstable__multilangue')) {
            return $this->localeRepository->findEnabledLocalesCodes();
        }

        return [$this->getDefaultTranslationLocale($admin)];
    }
}
