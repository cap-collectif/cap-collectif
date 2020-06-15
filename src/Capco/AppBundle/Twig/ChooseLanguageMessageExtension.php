<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ChooseLanguageMessageExtension extends AbstractExtension
{
    protected $translator;
    protected $toggleManager;
    protected $localeDataloader;

    public function __construct(
        TranslatorInterface $translator,
        Manager $manager,
        PublishedLocalesDataloader $localesDataloader
    ) {
        $this->translator = $translator;
        $this->toggleManager = $manager;
        $this->localeDataloader = $localesDataloader;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('get_locale_choice_trans', [$this, 'getLocaleChoiceTranslations']),
        ];
    }

    public function getLocaleChoiceTranslations(): array
    {
        $translations = [];
        if ($this->toggleManager->isActive('unstable__multilangue')) {
            $publishedLocales = $this->localeDataloader->__invoke();
            foreach ($publishedLocales as $locale) {
                $code = $locale->getCode();
                $translations[] = [
                    'code' => $code,
                    'message' => $this->translator->trans(
                        'would-you-like-to-consult-the-site-in-your-own-language',
                        [],
                        'CapcoAppBundle',
                        $code
                    ),
                    'label' => $this->translator->trans(
                        'global.continue',
                        [],
                        'CapcoAppBundle',
                        $code
                    ),
                ];
            }
        }

        return $translations;
    }
}
