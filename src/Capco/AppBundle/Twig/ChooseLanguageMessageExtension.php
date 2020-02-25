<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Translation\TranslatorInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ChooseLanguageMessageExtension extends AbstractExtension
{
    protected $translator;
    protected $localeRepository;
    protected $toggleManager;

    public function __construct(TranslatorInterface $translator, LocaleRepository $localeRepository, Manager $manager)
    {
        $this->translator = $translator;
        $this->localeRepository = $localeRepository;
        $this->toggleManager = $manager;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('get_locale_choice_trans', [$this, 'getLocaleChoiceTranslations'])];
    }

    public function getLocaleChoiceTranslations(): array
    {
        $translations = [];

        if ($this->toggleManager->isActive('unstable__multilangue')){
            $publishedLocales = $this->localeRepository->findEnabledLocales();
            foreach ($publishedLocales as $locale){
                $code = $locale->getCode();
                $translations[] = [
                    'code' => $code,
                    'message' => $this->translator->trans('would-you-like-to-consult-the-site-in-your-own-language',
                        [], 'CapcoAppBundle', $code),
                    'label' => $this->translator->trans('global.continue',
                        [], 'CapcoAppBundle', $code)
                ];
            }
        }
        return $translations;
    }
}
