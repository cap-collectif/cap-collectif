<?php

namespace Capco\AppBundle\GraphQL\Resolver\Locale;

use Capco\AppBundle\Repository\LocaleRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class LocalesQueryResolver implements ResolverInterface
{
    protected $localeRepository;

    public function __construct(LocaleRepository $localeRepository)
    {
        $this->localeRepository = $localeRepository;
    }

    public function __invoke(): array
    {
        return $this->localeRepository->findPublishedLocales();
    }
}
