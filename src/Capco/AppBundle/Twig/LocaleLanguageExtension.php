<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\GraphQL\Resolver\Locale\LocalesQueryResolver;
use Symfony\Component\Translation\TranslatorInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class LocaleLanguageExtension extends AbstractExtension
{
    protected $resolver;
    protected $translator;

    public function __construct(LocalesQueryResolver $resolver, TranslatorInterface $translator)
    {
        $this->resolver = $resolver;
        $this->translator= $translator;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('formatted_locales', [$this, 'getLocaleMap'])];
    }

    public function getLocaleMap(): array
    {
        $locales = $this->resolver->__invoke();
        $parsedLocales = array_map(function (Locale $locale) {
            return [
                'translationKey' => $this->translator->trans($locale->getTraductionKey(),
                    [], 'CapcoAppBundle', $locale->getCode()),
                'code' => $locale->getCode()
            ];
        }, $locales);

        return $parsedLocales;
    }
}
