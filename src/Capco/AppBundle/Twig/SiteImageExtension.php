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

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'site_image';
    }

    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction('capco_site_image_media', array($this, 'getSiteImageMedia'), array('is_safe' => array('html'))),
       );
    }

    public function getSiteImageMedia($key)
    {
        return $this->resolver->getMedia($key);
    }
}
