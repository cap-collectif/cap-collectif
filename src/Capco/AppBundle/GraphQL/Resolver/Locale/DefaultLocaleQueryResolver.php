<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class DefaultLocaleQueryResolver implements QueryInterface
{
    protected $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(): Locale
    {
        return $this->localeRepository->findDefaultLocale();
    }
}
