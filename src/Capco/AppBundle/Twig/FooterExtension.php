<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class FooterExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('getFooterLinks', [FooterRuntime::class, 'getFooterLinks']),
            new TwigFunction('getFooterSocialNetworks', [
                FooterRuntime::class,
                'getFooterSocialNetworks',
            ]),
            new TwigFunction('getLegalsPages', [FooterRuntime::class, 'getLegalsPages']),
            new TwigFunction('isNextLinkEnabled', [FooterRuntime::class, 'isNextLinkEnabled']),
        ];
    }
}
