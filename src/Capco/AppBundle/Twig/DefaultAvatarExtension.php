<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\SiteImage\Resolver;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class DefaultAvatarExtension extends AbstractExtension
{
    protected $resolver;

    public function __construct(Resolver $resolver)
    {
        $this->resolver = $resolver;
    }

    public function getFilters(): array
    {
        return [new TwigFilter('capco_default_avatar', [$this, 'getDefaultAvatarIfNull'])];
    }

    public function getDefaultAvatarIfNull($media)
    {
        if (null !== $media) {
            return $media;
        }

        return $this->resolver->getMedia('image.default_avatar');
    }
}
