<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Locale\DefaultLocaleCodeDataloader;
use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Negotiation\LanguageNegotiator;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\RuntimeExtensionInterface;

class BrowserLanguageRuntime implements RuntimeExtensionInterface
{
    public function __construct(
        protected Manager $toggleManager,
        protected PublishedLocalesDataloader $localeDataloader,
        protected DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader
    ) {
    }

    public function getBrowserLanguage(Request $request, $viewer = null): string
    {
        if ($this->toggleManager->isActive(Manager::multilangue)) {
            $availableLocales = array_map(
                fn (Locale $locale) => $locale->getCode(),
                $this->localeDataloader->__invoke($viewer)
            );

            if ($request->cookies && $request->cookies->has('locale')) {
                $chosenLocale = $request->cookies->get('locale');
                if (\in_array($chosenLocale, $availableLocales, true)) {
                    return $chosenLocale;
                }
            }
            $chosenLocale = $this->defaultLocaleCodeDataloader->__invoke();

            if (null !== ($acceptLanguages = $request->headers->get('Accept-Language'))) {
                $negotiator = new LanguageNegotiator();
                $bestLanguage = $negotiator->getBest($acceptLanguages, $availableLocales);

                if (null !== $bestLanguage) {
                    $chosenLocale = $bestLanguage->getValue();
                }
            }

            return $chosenLocale;
        }

        return $this->defaultLocaleCodeDataloader->__invoke();
    }
}
