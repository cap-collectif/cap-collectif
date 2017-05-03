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

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('capco_default_avatar', [$this, 'getDefaultAvatarIfNull']),
        ];
    }

    public function getDefaultAvatarIfNull($media)
    {
        if (null !== $media) {
            return $media;
        }

        return $this->resolver->getMedia('image.default_avatar');
    }
}
