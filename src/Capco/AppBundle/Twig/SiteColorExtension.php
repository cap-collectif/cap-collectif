<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteColor\Resolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class SiteColorExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'capco_site_color_value',
                [$this, 'getSiteColorValue'],
                ['is_safe' => ['html']]
            )
        ];
    }

    public function getSiteColorValue($key)
    {
        return $this->resolver->getValue($key);
    }
}
