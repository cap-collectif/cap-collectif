<?php

namespace Capco\AppBundle\Router;

use JMS\I18nRoutingBundle\Router\PatternGenerationStrategyInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Translation\TranslatorInterface;

/*
 * This class is used to override the route naming convention from the JMS Routing Bundle.
 * In particular, we want our route to be prefixed not by the full locale but only the country identifier.
 * For instance: en-GB -> /en and not /en-GB
 * This strategy is applied in the method "formatLocale".
 */
class DefaultPatternGenerationStrategy implements PatternGenerationStrategyInterface
{
    const STRATEGY_PREFIX = 'prefix';
    const STRATEGY_PREFIX_EXCEPT_DEFAULT = 'prefix_except_default';
    const STRATEGY_CUSTOM = 'custom';

    private $strategy;
    private $translator;
    private $translationDomain;
    private $locales;
    private $cacheDir;
    private $defaultLocale;

    public function __construct(
        $strategy,
        TranslatorInterface $translator,
        array $locales,
        $cacheDir,
        $translationDomain = 'routes',
        //Not really a locale but the locale prefix, not used with our strategy (prefix all)
        $defaultLocale = 'fr'
    ) {
        $this->strategy = $strategy;
        $this->translator = $translator;
        $this->translationDomain = $translationDomain;
        $this->locales = $locales;
        $this->cacheDir = $cacheDir;
        $this->defaultLocale = $defaultLocale;
    }

    //Method to authorize having a locale different from prefix in url
    public static function getLocalePrefix(string $locale)
    {
        return substr($locale, 0, strpos($locale, '-'));
    }

    public function generateI18nPatterns($routeName, Route $route): array
    {
        $patterns = [];
        foreach ($route->getOption('i18n_locales') ?: $this->locales as $locale) {
            $i18nPattern = $this->translator->trans(
                $routeName,
                [],
                $this->translationDomain,
                $locale
            );

            // prefix with locale if requested
            if (
                self::STRATEGY_PREFIX === $this->strategy ||
                (self::STRATEGY_PREFIX_EXCEPT_DEFAULT === $this->strategy &&
                    $this->defaultLocale !== $locale)
            ) {
                $i18nPattern = '/' . self::getLocalePrefix($locale) . $i18nPattern;
                if (null !== $route->getOption('i18n_prefix')) {
                    $i18nPattern = $route->getOption('i18n_prefix') . $i18nPattern;
                }
            }

            $patterns[$i18nPattern][] = $locale;
        }

        return $patterns;
    }

    /**
     * {@inheritdoc}
     */
    public function addResources(RouteCollection $i18nCollection)
    {
        foreach ($this->locales as $locale) {
            if (
                file_exists(
                    $metadata = $this->cacheDir . '/translations/catalogue.' . $locale . '.php.meta'
                )
            ) {
                foreach (unserialize(file_get_contents($metadata)) as $resource) {
                    $i18nCollection->addResource($resource);
                }
            }
        }
    }
}
