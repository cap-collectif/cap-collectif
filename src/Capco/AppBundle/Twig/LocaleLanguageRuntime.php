<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Extension\RuntimeExtensionInterface;

class LocaleLanguageRuntime implements RuntimeExtensionInterface
{
    public function __construct(protected TranslatorInterface $translator, protected PublishedLocalesDataloader $localesDataloader, protected Manager $manager)
    {
    }

    public function getLocaleMap($viewer = null): array
    {
        if (!$this->manager->isActive(Manager::multilangue)) {
            return [];
        }

        $publishedLocales = $this->localesDataloader->__invoke($viewer);

        return array_map(function (Locale $locale) {
            return [
                'translationKey' => $this->translator->trans(
                    $locale->getTraductionKey(),
                    [],
                    'CapcoAppBundle',
                    $locale->getCode()
                ),
                'code' => $locale->getCode(),
            ];
        }, $publishedLocales);
    }
}
