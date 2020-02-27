<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Locale\DefaultLocaleCodeDataloader;
use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Negotiation\LanguageNegotiator;
use Symfony\Component\HttpFoundation\Request;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class BrowserLanguageExtension extends AbstractExtension
{
    protected $toggleManager;
    protected $localeDataloader;
    protected $defaultLocaleCodeDataloader;

    public function __construct(Manager $manager,
                                PublishedLocalesDataloader $localesDataloader,
                                DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader)
    {
        $this->toggleManager = $manager;
        $this->localeDataloader = $localesDataloader;
        $this->defaultLocaleCodeDataloader = $defaultLocaleCodeDataloader;
    }

    public function getFunctions(): array
    {
        return [new TwigFunction('get_browser_language', [$this, 'getBrowserLanguage'])];
    }

    public function getBrowserLanguage(Request $request): string
    {
        if ($this->toggleManager->isActive('unstable__multilangue')) {
            $availableLocales = array_map(function (Locale $locale){
                return $locale->getCode();
            }, $this->localeDataloader->__invoke());

            if ($request->cookies && $request->cookies->has('locale')) {
                $chosenLocale = $request->cookies->get('locale');
                if (in_array($chosenLocale, $availableLocales, true)) {
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
