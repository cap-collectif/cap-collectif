<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class LocalesQueryResolver implements ResolverInterface
{
    protected LocaleRepository $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke($viewer): array
    {
        $isSuperAdmin = $viewer ? $viewer->isSuperAdmin() : false;

        return $this->localeRepository->findPublishedLocales($isSuperAdmin);
    }
}
