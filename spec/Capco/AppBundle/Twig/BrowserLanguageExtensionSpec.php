<?php

namespace spec\Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Locale\DefaultLocaleCodeDataloader;
use Capco\AppBundle\Locale\PublishedLocalesDataloader;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\BrowserLanguageExtension;
use PhpSpec\ObjectBehavior;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBag;
use Symfony\Component\HttpFoundation\HeaderBag;
use Symfony\Component\HttpFoundation\Request;

class BrowserLanguageExtensionSpec extends ObjectBehavior
{
    public function let(Manager $manager,
                        PublishedLocalesDataloader $dataloader, DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader)
    {
        $this->beConstructedWith($manager, $dataloader, $defaultLocaleCodeDataloader);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(BrowserLanguageExtension::class);
    }

    public function it_get_browser_language_no_multi(Request $request, Manager $manager, DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader)
    {
        $defaultLocaleCodeDataloader->__invoke()->willReturn('fr-FR');
        $manager->isActive('unstable__multilangue')->willReturn(false);
        $this->getBrowserLanguage($request)->shouldReturn('fr-FR');
    }

    public function it_get_browser_language_with_cookie_en_GB(Request $request, ParameterBag $bag, Manager $manager,
                                                              PublishedLocalesDataloader $dataloader)
    {
        $bag->has('locale')->willReturn(true);
        $bag->get('locale')->willReturn('en-GB');
        $request->cookies = $bag;
        $availableLocales = [
            new Locale('fr-FR', 'french'),
            new Locale('en-GB', 'english'),
            new Locale('es-ES', 'spanish'),
            new Locale('de-DE', 'deutsch'),
        ];
        $dataloader->__invoke()->willReturn($availableLocales);
        $manager->isActive('unstable__multilangue')->willReturn(true);
        $this->getBrowserLanguage($request)->shouldReturn('en-GB');
    }

    public function it_get_browser_language_without_cookie(Request $request, Manager $manager,
                                                           PublishedLocalesDataloader $dataloader,
                                                           DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader,
                                                           ParameterBag $bag, HeaderBag $headerBag)
    {
        $availableLocales = [
            new Locale('fr-FR', 'french'),
            new Locale('en-GB', 'english'),
            new Locale('es-ES', 'spanish'),
            new Locale('de-DE', 'deutsch'),
        ];
        $dataloader->__invoke()->willReturn($availableLocales);
        $manager->isActive('unstable__multilangue')->willReturn(true);
        $defaultLocaleCodeDataloader->__invoke()->willReturn('fr-FR');

        $bag->has('locale')->willReturn(false);
        $request->cookies = $bag;
        $headerBag->set('Accept-Language', 'fr-FR,fr;q=0.9,ja;q=0.8,en-US;q=0.7,en;q=0.6,ja-JP;q=0.5,nl;q=0.4');
        $request->headers = $headerBag;

        $this->getBrowserLanguage($request)->shouldReturn('fr-FR');

    }

    public function it_get_browser_language_with_cookie_not_existing_locale(Request $request, Manager $manager, DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader,
                                                                            PublishedLocalesDataloader $dataloader, ParameterBag $bag, HeaderBag $headerBag)
    {
        $dataloader->__invoke()->willReturn([
            new Locale('fr-FR', 'french'),
            new Locale('en-GB', 'english'),
            new Locale('es-ES', 'spanish'),
            new Locale('de-DE', 'deutsch'),
        ]);
        $bag->has('locale')->willReturn(true);
        // This locale unfortunately does not yet exist.
        $bag->get('locale')->willReturn('jp-EC');
        $request->cookies = $bag;
        $defaultLocaleCodeDataloader->__invoke()->willReturn('fr-FR');
        $headerBag->set('Accept-Language', 'fr-FR,fr;q=0.9,ja;q=0.8,en-US;q=0.7,en;q=0.6,ja-JP;q=0.5,nl;q=0.4');
        $request->headers = $headerBag;

        $manager->isActive('unstable__multilangue')->willReturn(true);
        $this->getBrowserLanguage($request)->shouldReturn('fr-FR');
    }

    public function it_get_browser_language_with_cookie_existing_locale_not_published(Request $request, DefaultLocaleCodeDataloader $defaultLocaleCodeDataloader, Manager $manager,
                                                                                      PublishedLocalesDataloader $dataloader, ParameterBag $bag, HeaderBag $headerBag)
    {
        $dataloader->__invoke()->willReturn([
            new Locale('fr-FR', 'french'),
            new Locale('en-GB', 'english'),
            new Locale('es-ES', 'spanish'),
            new Locale('de-DE', 'deutsch'),
        ]);
        $bag->has('locale')->willReturn(true);
        // This locale does exist but is not currently published in our platform
        $bag->get('locale')->willReturn('ja-JP');
        $request->cookies = $bag;
        $defaultLocaleCodeDataloader->__invoke()->willReturn('fr-FR');
        $headerBag->set('Accept-Language', 'fr-FR,fr;q=0.9,ja;q=0.8,en-US;q=0.7,en;q=0.6,ja-JP;q=0.5,nl;q=0.4');
        $request->headers = $headerBag;

        $manager->isActive('unstable__multilangue')->willReturn(true);
        $this->getBrowserLanguage($request)->shouldReturn('fr-FR');
    }
}
