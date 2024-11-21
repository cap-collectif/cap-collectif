<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\SiteImage\Resolver;
use Twig\Extension\RuntimeExtensionInterface;

class DefaultAvatarRuntime implements RuntimeExtensionInterface
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getDefaultAvatarIfNull(?Media $media): ?Media
    {
        return $media ?? $this->resolver->getMedia('image.default_avatar');
    }
}
