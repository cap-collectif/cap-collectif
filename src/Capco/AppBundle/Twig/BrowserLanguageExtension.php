<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\GraphQL\Resolver\Locale\LocalesQueryResolver;
use Capco\AppBundle\Resolver\LocaleResolver;
use Negotiation\LanguageNegotiator;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class BrowserLanguageExtension extends AbstractExtension
{
    protected $resolver;
    protected $container;
    protected $localeResolver;

    public function __construct(LocalesQueryResolver $resolver, ContainerInterface $container, LocaleResolver $localeResolver)
    {
        $this->resolver = $resolver;
        $this->container = $container;
        $this->localeResolver = $localeResolver;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('get_browser_language', [$this, 'getBrowserLanguage'])];
    }

    public function getBrowserLanguage(Request $request): string
    {
        $chosenLocale = $this->localeResolver->getDefaultLocaleCode();
        $availableLocales = $this->container->getParameter('locales');

        if (null !== ($acceptLanguages = $request->headers->get('Accept-Language'))) {
            $negotiator = new LanguageNegotiator();
            $bestLanguage = $negotiator->getBest($acceptLanguages, $availableLocales);

            if (null !== $bestLanguage) {
                $chosenLocale = $bestLanguage->getValue();
            }
        }
        return $chosenLocale;
    }
}
