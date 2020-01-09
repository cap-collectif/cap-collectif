<?php

namespace Capco\AppBundle\SiteParameter;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Toggle\Manager;

class SiteParameterFilter
{
    private const FEATURE_CONDITIONS = [
        'global.locale' => [
            'feature' => 'unstable__multilangue',
            'isActive' => false
        ]
    ];
    private $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function isSiteParameterFeatured(SiteParameter $parameter): bool
    {
        if (\array_key_exists($parameter->getKeyname(), self::FEATURE_CONDITIONS)) {
            $featureCondition = self::FEATURE_CONDITIONS[$parameter->getKeyname()];

            return $this->toggleManager->isActive($featureCondition['feature']) ==
                $featureCondition['isActive'];
        }

        return true;
    }
}
