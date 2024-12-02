<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class LocalesQueryResolver implements QueryInterface
{
    public function __construct(protected LocaleRepository $localeRepository)
    {
    }

    public function __invoke($viewer): array
    {
        $isSuperAdmin = $viewer ? $viewer->isSuperAdmin() : false;

        return $this->localeRepository->findPublishedLocales($isSuperAdmin);
    }
}
