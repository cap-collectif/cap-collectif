<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class DevUsersExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            // @phpstan-ignore-next-line Twig runtime pattern - known false positive
            new TwigFunction('dev_users', [DevUsersRuntime::class, 'getDevUsers']),
        ];
    }
}
