<?php

namespace Capco\AppBundle\Locale;

use Capco\AppBundle\Repository\LocaleRepository;

class PublishedLocalesDataloader
{
    private array $publishedLocales = [];
    private LocaleRepository $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke($viewer = null): array
    {
        if (!empty($this->publishedLocales)) {
            return $this->publishedLocales;
        }
        $isSuperAdmin = $viewer ? $viewer->isSuperAdmin() : false;
        $this->publishedLocales = $this->localeRepository->findPublishedLocales($isSuperAdmin);

        return $this->publishedLocales;
    }
}
