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
    protected $symfonyConfigurationLocale;
    protected $locales;
    private $localeRepository;

    public function __construct(
        LocaleRepository $localeRepository,
        LocalesQueryResolver $resolver,
        ContainerInterface $container,
        LoggerInterface $logger,
        $locale,
        $locales
    ) {
        $this->localesQueryResolver = $resolver;
        $this->container = $container;
        $this->localeRepository = $localeRepository;
        $this->logger = $logger;
        $this->symfonyConfigurationLocale = $locale;
        $this->locales = $locales;
    }

    public function getDefaultLocaleCode(): string
    {
        try {
            $defaultLocale = $this->localeRepository->getDefaultCode();
        } catch (LocaleConfigurationException $e) {
            $defaultLocale = $this->symfonyConfigurationLocale;
            $this->logger->warning(
                'Default locale is not configured with unstable__multilangue yet activated: using symfony s default locale'
            );
        }

        return $defaultLocale;
    }

    public function getDefaultLocaleCodeForRequest(?Request $request = null): string
    {
        $chosenLocale = $this->container->getParameter('locale');

        try {
            $chosenLocale = $this->localeRepository->getDefaultCode();
        } catch (\Exception $e) {
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
