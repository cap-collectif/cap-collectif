<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;
use Capco\AppBundle\Toggle\Manager;

class ParametersExtension extends \Twig_Extension
{
    protected $manager;
    protected $siteParameterResolver;

    public function __construct(Manager $manager, Resolver $siteParameterResolver)
    {
        $this->manager = $manager;
        $this->siteParameterResolver = $siteParameterResolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('is_feature_enabled', [$this, 'getIsFeatureEnabled']),
            new \Twig_SimpleFunction('has_feature_enabled', [$this, 'getHasFeatureEnabled']),
            new \Twig_SimpleFunction('features_list', [$this, 'getFeatures']),
            new \Twig_SimpleFunction('site_parameters_list', [$this, 'getSiteParameters']),
       ];
    }

    public function getIsFeatureEnabled($flag)
    {
        return $this->manager->isActive($flag);
    }

    public function getHasFeatureEnabled($flags)
    {
        return $this->manager->hasOneActive($flags);
    }

    public function getFeatures()
    {
        return $this->manager->all();
    }

    public function getSiteParameters()
    {
        $keys = [
            'login.text.top',
            'login.text.bottom',
            'signin.cgu.name',
            'signin.cgu.link',
        ];

        $exposedParameters = [];
        foreach ($keys as $key) {
            $value = $this->siteParameterResolver->getValue($key);
            $exposedParameters[$key] = $value && strlen($value) > 0 ? $value : null;
        }

        return $exposedParameters;
    }
}
