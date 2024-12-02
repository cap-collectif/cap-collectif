<?php

namespace Capco\AppBundle\Router;

use JMS\I18nRoutingBundle\Router\PatternGenerationStrategyInterface;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Contracts\Translation\TranslatorInterface;

/*
 * This class is used to override the route naming convention from the JMS Routing Bundle.
 * In particular, we want our route to be prefixed not by the full locale but only the country identifier.
 * For instance: en-GB -> /en and not /en-GB
 * This strategy is applied in the method "formatLocale".
 */
class DefaultPatternGenerationStrategy implements PatternGenerationStrategyInterface
{
    final public const STRATEGY_PREFIX = 'prefix';
    final public const STRATEGY_PREFIX_EXCEPT_DEFAULT = 'prefix_except_default';
    final public const STRATEGY_CUSTOM = 'custom';

    public function __construct(
        private $strategy,
        private readonly TranslatorInterface $translator,
        private readonly array $locales,
        private $cacheDir,
        private $translationDomain = 'routes',
        //Not really a locale but the locale prefix, not used with our strategy (prefix all)
        private $defaultLocale = 'fr'
    ) {
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
                self::STRATEGY_PREFIX === $this->strategy
                || (self::STRATEGY_PREFIX_EXCEPT_DEFAULT === $this->strategy
                    && $this->defaultLocale !== $locale)
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
