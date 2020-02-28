<?php

namespace Capco\AppBundle\Router;

use Capco\AppBundle\Toggle\Manager;
use JMS\I18nRoutingBundle\Router\PatternGenerationStrategyInterface;
use JMS\I18nRoutingBundle\Router\RouteExclusionStrategyInterface;
use Symfony\Component\Routing\RouteCollection;

class I18nLoader
{
    const ROUTING_PREFIX = '__RG__';

    private $routeExclusionStrategy;
    private $patternGenerationStrategy;
    private $manager;

    public function __construct(Manager $manager,
        RouteExclusionStrategyInterface $routeExclusionStrategy,
                                PatternGenerationStrategyInterface $patternGenerationStrategy)
    {
        $this->routeExclusionStrategy = $routeExclusionStrategy;
        $this->patternGenerationStrategy = $patternGenerationStrategy;
        $this->manager = $manager;
    }

    public function load(RouteCollection $collection)
    {
        try {
            if (!$this->manager->isActive('unstable__multilangue')){
                return $collection;
            }
        }catch (\Exception $e){
            // If an error occurs, it is probably during cache warm-up, so we keep the default route.
            return $collection;
        }


        $i18nCollection = new RouteCollection();

        foreach ($collection->getResources() as $resource) {
            $i18nCollection->addResource($resource);
        }
        $this->patternGenerationStrategy->addResources($i18nCollection);

        foreach ($collection->all() as $name => $route) {
            if ($this->routeExclusionStrategy->shouldExcludeRoute($name, $route)) {
                $i18nCollection->add($name, $route);
                continue;
            }

            foreach ($this->patternGenerationStrategy->generateI18nPatterns($name, $route) as $pattern => $locales) {
                // If this pattern is used for more than one locale, we need to keep the original route.
                // We still add individual routes for each locale afterwards for faster generation.
                if (count($locales) > 1) {
                    $catchMultipleRoute = clone $route;
                    $catchMultipleRoute->setPath($pattern);
                    $catchMultipleRoute->setDefault('_locales', $locales);
                    $i18nCollection->add(implode('_', $locales). self::ROUTING_PREFIX.$name, $catchMultipleRoute);
                }

                foreach ($locales as $locale) {
                    $localeRoute = clone $route;
                    $localeRoute->setPath($pattern);
                    $localeRoute->setDefault('_locale', $locale);
                    $i18nCollection->add($locale.self::ROUTING_PREFIX.$name, $localeRoute);
                }
            }
        }

        return $i18nCollection;
    }
}
