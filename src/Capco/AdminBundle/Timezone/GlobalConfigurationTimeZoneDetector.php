<?php

namespace Capco\AdminBundle\Timezone;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Sonata\IntlBundle\Timezone\TimezoneDetectorInterface;

class GlobalConfigurationTimeZoneDetector implements TimezoneDetectorInterface
{
    public function __construct(
        protected SiteParameterResolver $resolver
    ) {
    }

    public function getTimezone(): string
    {
        return explode(' ', (string) $this->resolver->getValue('global.timezone'))[0];
    }
}
