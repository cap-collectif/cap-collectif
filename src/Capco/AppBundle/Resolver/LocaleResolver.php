<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Exception\LocaleConfigurationException;
use Capco\AppBundle\GraphQL\Resolver\Locale\LocalesQueryResolver;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Router\DefaultPatternGenerationStrategy;
use Negotiation\LanguageNegotiator;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

class LocaleResolver
{
    protected $localesQueryResolver;
    protected $container;
    protected $logger;

    public function __construct(
        private readonly LocaleRepository $localeRepository,
        LocalesQueryResolver $resolver,
        ContainerInterface $container,
        LoggerInterface $logger,
        protected $locale,
        protected $locales
    ) {
        $this->localesQueryResolver = $resolver;
        $this->container = $container;
        $this->logger = $logger;
    }

    public function getDefaultLocaleCode(): string
    {
        try {
            $defaultLocale = $this->localeRepository->getDefaultCode();
        } catch (LocaleConfigurationException) {
            $defaultLocale = $this->locale;
            $this->logger->warning(
                'Default locale is not configured with multilangue yet activated: using symfony s default locale'
            );
        }

        return $defaultLocale;
    }

    public function getDefaultLocaleCodeForRequest(?Request $request = null): string
    {
        $chosenLocale = $this->container->getParameter('locale');

        try {
            $chosenLocale = $this->localeRepository->getDefaultCode();
        } catch (\Exception) {
        }
        if (null === $request) {
            return $chosenLocale;
        }
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

    public function getDefaultLocaleRoutePrefix(): string
    {
        return DefaultPatternGenerationStrategy::getLocalePrefix($this->getDefaultLocaleCode());
    }
}
