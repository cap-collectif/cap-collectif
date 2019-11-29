<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class AvailableLocalesQueryResolver implements ResolverInterface
{
    protected $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Argument $args): array
    {
        $includeDisabled = $args->offsetGet('includeDisabled');
        if ($includeDisabled) {
            $locales = $this->localeRepository->findAll();
        } else {
            $locales = $this->localeRepository->findEnabledLocales();
        }

        return $locales;
    }
}
