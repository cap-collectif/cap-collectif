<?php

namespace spec\Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Controller\Site\PageController;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\PageTranslation;
use Capco\AppBundle\Repository\SiteParameterRepository;
use PhpSpec\ObjectBehavior;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\Translation\TranslatorInterface;

class PageControllerSpec extends ObjectBehavior
{
    public function let(
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $this->beConstructedWith($siteParameterRepository, $translator);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(PageController::class);
        $this->shouldBeAnInstanceOf(AbstractController::class);
    }

    public function it_returns_page_and_translation_when_page_is_enabled(
        TranslatorInterface $translator
    ) {
        $translator->trans('charter', [], 'CapcoAppBundle')->willReturn('charter');

        $page = new Page();
        $pageTranslation = (new PageTranslation())->setLocale('en-GB')->setSlug('faq-en');
        $page->addTranslation($pageTranslation);

        $request = new Request([], [], ['slug' => 'faq-en']);
        $request->setLocale('en-GB');

        $this->showAction($request, $pageTranslation)->shouldReturn([
            'page' => $page,
            'pageTranslation' => $pageTranslation,
        ]);
    }

    public function it_throws_not_found_when_page_translation_is_missing(
        TranslatorInterface $translator
    ) {
        $translator->trans('charter', [], 'CapcoAppBundle')->willReturn('charter');
        $translator
            ->trans('page.error.not_found', [], 'CapcoAppBundle')
            ->willReturn('Page not found')
        ;

        $request = new Request([], [], ['slug' => 'faq']);
        $request->setLocale('en-GB');

        $this
            ->shouldThrow(new NotFoundHttpException('Page not found'))
            ->during('showAction', [$request, null])
        ;
    }

    public function it_throws_not_found_when_page_is_disabled(
        TranslatorInterface $translator
    ) {
        $translator->trans('charter', [], 'CapcoAppBundle')->willReturn('charter');
        $translator
            ->trans('page.error.not_found', [], 'CapcoAppBundle')
            ->willReturn('Page not found')
        ;

        $page = (new Page())->setIsEnabled(false);
        $pageTranslation = (new PageTranslation())->setLocale('en-GB')->setSlug('faq-en');
        $page->addTranslation($pageTranslation);

        $request = new Request([], [], ['slug' => 'faq-en']);
        $request->setLocale('en-GB');

        $this
            ->shouldThrow(new NotFoundHttpException('Page not found'))
            ->during('showAction', [$request, $pageTranslation])
        ;
    }
}
