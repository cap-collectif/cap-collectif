<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AvailableLocalesQueryResolver implements QueryInterface
{
    protected LocaleRepository $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(Argument $args, $viewer): array
    {
        $includeDisabled = $args->offsetGet('includeDisabled');
        $isSuperAdmin = $viewer ? $viewer->isSuperAdmin() : false;
        if ($includeDisabled) {
            return $this->localeRepository->findAll($isSuperAdmin);
        }

        return $this->localeRepository->findPublishedLocales($isSuperAdmin);
    }
}
