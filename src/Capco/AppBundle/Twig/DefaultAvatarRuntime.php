<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteImage\Resolver;
use Twig\Extension\RuntimeExtensionInterface;

class DefaultAvatarRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getDefaultAvatarIfNull($media)
    {
        if (null !== $media) {
            return $media;
        }

        return $this->resolver->getMedia('image.default_avatar');
    }
}
