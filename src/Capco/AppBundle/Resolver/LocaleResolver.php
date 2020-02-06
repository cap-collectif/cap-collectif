<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Locale\LocalesQueryResolver;
use Capco\AppBundle\Repository\LocaleRepository;
use Negotiation\LanguageNegotiator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class LocaleResolver
{
    private $localeRepository;
    protected $localesQueryResolver;
    protected $container;

    public function __construct(LocaleRepository $localeRepository, LocalesQueryResolver $resolver, ContainerInterface $container)
    {
        $this->localesQueryResolver = $resolver;
        $this->container = $container;
        $this->localeRepository = $localeRepository;
    }

    public function getDefaultLocaleCodeForRequest(?Request $request = null): string
    {
        $chosenLocale = $this->container->getParameter('locale');
        try {
            $chosenLocale = $this->localeRepository->getDefaultCode();
        } catch (\Exception $e) {
        }
        if ($request === null){
            return $chosenLocale;
        }
        $availableLocales = $this->container->getParameter('locales');
        if (null !== $acceptLanguages = $request->headers->get('Accept-Language')) {
            $negotiator = new LanguageNegotiator();
            $bestLanguage = $negotiator->getBest(
                $acceptLanguages,
                $availableLocales
            );

            if (null !== $bestLanguage) {
                $chosenLocale = $bestLanguage->getValue();
            }
        }
        return $chosenLocale;
    }
}
