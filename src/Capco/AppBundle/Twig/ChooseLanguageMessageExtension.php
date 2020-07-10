<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ChooseLanguageMessageExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_locale_choice_trans', [
                ChooseLanguageMessageRuntime::class,
                'getLocaleChoiceTranslations',
            ]),
        ];
    }
}
