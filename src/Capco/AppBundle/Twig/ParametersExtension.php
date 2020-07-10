<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ParametersExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('is_feature_enabled', [
                ParametersRuntime::class,
                'getIsFeatureEnabled',
            ]),
            new TwigFunction('has_feature_enabled', [
                ParametersRuntime::class,
                'getHasFeatureEnabled',
            ]),
            new TwigFunction('features_list', [ParametersRuntime::class, 'getFeatures']),
            new TwigFunction('site_parameters_list', [
                ParametersRuntime::class,
                'getSiteParameters',
            ]),
            new TwigFunction('availableLocales', [ParametersRuntime::class, 'getAvailableLocales']),
        ];
    }
}
