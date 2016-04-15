<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Toggle\Manager;

class FeatureToggleExtension extends \Twig_Extension
{
    protected $manager;

    public function __construct(Manager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'feature_toggle';
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('is_feature_enabled', [$this, 'getIsFeatureEnabled']),
            new \Twig_SimpleFunction('has_feature_enabled', [$this, 'getHasFeatureEnabled']),
            new \Twig_SimpleFunction('features_list', [$this, 'getFeatures']),
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
}
