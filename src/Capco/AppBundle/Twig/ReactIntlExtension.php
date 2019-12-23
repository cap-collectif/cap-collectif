<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteParameter\Resolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ReactIntlExtension extends AbstractExtension
{
    private $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('intl_locale', [$this, 'getLocale']),
            new TwigFunction('intl_timeZone', [$this, 'getTimeZone'])
        ];
    }

    public function getLocale(): string
    {
        return $this->resolver->getValue('global.locale');
    }

    public function getTimeZone(): string
    {
        return $this->resolver->getValue('global.timezone');
    }
}
