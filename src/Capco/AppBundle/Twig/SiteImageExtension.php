<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteImage\Resolver;

class SiteImageExtension extends \Twig_Extension
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFunctions(): array
    {
        return [
            new \Twig_SimpleFunction('capco_site_image_media', [$this, 'getSiteImageMedia'], ['is_safe' => ['html']]),
       ];
    }

    public function getSiteImageMedia($key)
    {
        return $this->resolver->getMedia($key);
    }
}
