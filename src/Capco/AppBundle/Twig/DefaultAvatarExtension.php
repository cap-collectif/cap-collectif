<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class DefaultAvatarExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('capco_default_avatar', [
                DefaultAvatarRuntime::class,
                'getDefaultAvatarIfNull',
            ]),
        ];
    }
}
