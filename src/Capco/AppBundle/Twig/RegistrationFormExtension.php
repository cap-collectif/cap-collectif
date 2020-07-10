<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class RegistrationFormExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('registration_form_serialize', [
                RegistrationFormRuntime::class,
                'serializeFields',
            ]),
        ];
    }
}
