<?php

namespace spec\Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Controller\Site\DefaultController;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Doctrine\ORM\NoResultException;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Contracts\Translation\TranslatorInterface;

class DefaultControllerSpec extends ObjectBehavior
{
    public function it_is_initializable()
    {
        $this->shouldHaveType(DefaultController::class);
        $this->shouldBeAnInstanceOf(AbstractController::class);
    }

    public function it_should_throw_error_message_for_cookies_action(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $request
            ->getLocale()
            ->willReturn('FR-fr')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willThrow(NoResultException::class)
        ;

        $translator->trans('page.error.not_found')->willReturn('Page introuvable');

        $this->shouldThrow(new NotFoundHttpException('Page introuvable'))->during('cookiesAction', [$request, $siteParameterRepository, $translator]);
    }

    public function it_should_return_cookie_list(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        // Arrange
        $request
            ->getLocale()
            ->willReturn('fakeLocal')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willReturn('fake')
        ;

        // Act
        $cookieAction = $this->cookiesAction($request, $siteParameterRepository, $translator);

        // Assert
        $cookieAction->shouldReturn([]);
    }

    public function it_should_throw_error_message_for_privacy_policy_action(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $request
            ->getLocale()
            ->willReturn('FR-fr')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willThrow(NoResultException::class)
        ;

        $translator->trans('page.error.not_found')->willReturn('Page introuvable');

        $this->shouldThrow(new NotFoundHttpException('Page introuvable'))->during('privacyPolicyAction', [$request, $siteParameterRepository, $translator]);
    }

    public function it_should_return_privacy_policy(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        // Arrange
        $request
            ->getLocale()
            ->willReturn('fakeLocal')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willReturn('fake policy')
        ;

        // Act
        $privacyPolicyAction = $this->privacyPolicyAction($request, $siteParameterRepository, $translator);

        // Assert
        $privacyPolicyAction->shouldReturn(['privacy' => 'fake policy']);
    }

    public function it_should_throw_error_message_for_legal_mentions_action(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        $request
            ->getLocale()
            ->willReturn('FR-fr')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willThrow(NoResultException::class)
        ;

        $translator->trans('page.error.not_found')->willReturn('Page introuvable');

        $this->shouldThrow(new NotFoundHttpException('Page introuvable'))->during('legalMentionsAction', [$request, $siteParameterRepository, $translator]);
    }

    public function it_should_return_legal_mentions(
        Request $request,
        SiteParameterRepository $siteParameterRepository,
        TranslatorInterface $translator
    ) {
        // Arrange
        $request
            ->getLocale()
            ->willReturn('fakeLocal')
        ;

        $siteParameterRepository
            ->getValue(Argument::any(), Argument::any())
            ->willReturn('fake legal mentions')
        ;

        // Act
        $legalMentionsAction = $this->legalMentionsAction($request, $siteParameterRepository, $translator);

        // Assert
        $legalMentionsAction->shouldReturn(['legal' => 'fake legal mentions']);
    }
}
