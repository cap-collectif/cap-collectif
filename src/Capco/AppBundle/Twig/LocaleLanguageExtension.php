<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\Translation\TranslatorInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class LocaleLanguageExtension extends AbstractExtension
{
    protected $translator;
    protected $localesDataloader;
    protected $manager;

    public function __construct(TranslatorInterface $translator,
                                PublishedLocalesDataloader $localesDataloader, Manager $manager)
    {
        $this->translator= $translator;
        $this->localesDataloader = $localesDataloader;
        $this->manager = $manager;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('formatted_locales', [$this, 'getLocaleMap'])];
    }

    public function getLocaleMap(): array
    {
        $parsedLocales = [];
        if ($this->manager->isActive('unstable__multilangue')){
            $publishedLocales = $this->localesDataloader->__invoke();
            $parsedLocales = array_map(function (Locale $locale) {
                return [
                    'translationKey' => $this->translator->trans($locale->getTraductionKey(),
                        [], 'CapcoAppBundle', $locale->getCode()),
                    'code' => $locale->getCode()
                ];
            }, $publishedLocales);
        }
        return $parsedLocales;
    }
}
