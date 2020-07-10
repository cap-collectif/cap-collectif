<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class UserTypeExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [new TwigFunction('user_type_list', [UserTypeRuntime::class, 'getUserTypes'])];
    }
}
