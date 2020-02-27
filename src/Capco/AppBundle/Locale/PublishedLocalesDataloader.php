<?php

namespace Capco\AppBundle\Locale;

use Capco\AppBundle\Repository\LocaleRepository;

class PublishedLocalesDataloader
{
    private $publishedLocales;
    private $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(): array
    {
        if (!$this->publishedLocales){
            $this->publishedLocales = $this->localeRepository->findPublishedLocales();
        }

        return $this->publishedLocales;
    }

}
