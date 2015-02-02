<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteImage\Resolver;

class DefaultAvatarExtension extends \Twig_Extension
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
        return 'capco_default_avatar';
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('capco_default_avatar', array($this, 'getDefaultAvatarIfNull')),
        );
    }

    public function getDefaultAvatarIfNull($media)
    {
        if (null != $media) {
            return $media;
        } else {
            return $this->resolver->getMedia('image.default_avatar');
        }
    }
}
