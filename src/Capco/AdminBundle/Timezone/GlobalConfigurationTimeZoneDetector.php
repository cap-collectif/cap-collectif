<?php

namespace Capco\AdminBundle\Timezone;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Sonata\IntlBundle\Timezone\TimezoneDetectorInterface;

class GlobalConfigurationTimeZoneDetector implements TimezoneDetectorInterface
{
    protected SiteParameterResolver $resolver;

    public function __construct(SiteParameterResolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getTimezone(): string
    {
        return explode(' ', $this->resolver->getValue('global.timezone'))[0];
    }
}
