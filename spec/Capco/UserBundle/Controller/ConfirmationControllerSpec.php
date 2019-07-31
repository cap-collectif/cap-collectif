<?php

namespace spec\Capco\UserBundle\Controller;

use Prophecy\Argument;
use PhpSpec\ObjectBehavior;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Router;
use FOS\UserBundle\Security\LoginManager;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Repository\UserRepository;
use Capco\AppBundle\Manager\ContributionManager;
use Symfony\Component\HttpFoundation\Session\Session;
use Capco\UserBundle\Controller\ConfirmationController;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Translation\TranslatorInterface;

class ConfirmationControllerSpec extends ObjectBehavior
{
    public function let(
        UserManager $userManager,
        LoginManager $loginManager,
        Router $router,
        Session $session,
        ContributionManager $contributionManager,
        TranslatorInterface $translator,
        UserRepository $userRepo
    ) {
        $this->beConstructedWith(
            $userManager,
            $loginManager,
            $router,
            $session,
            $contributionManager,
            $translator,
            $userRepo
        );
        $this->login = false;
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ConfirmationController::class);
    }

    public function it_can_not_confirm_an_email_of_unknown_token(
        UserManager $userManager,
        Session $session,
        LoginManager $loginManager,
        FlashBagInterface $flashBag,
        Router $router,
        ContributionManager $contributionManager,
        TranslatorInterface $translator
    ) {
        $router->generate('app_homepage')->willReturn('/');
        $session->getFlashBag()->willReturn($flashBag);
        $userManager
            ->findUserByConfirmationToken('unknowntoken')
            ->shouldBeCalled()
            ->willReturn(null);
        $translator
            ->trans('global.alert.already_email_confirmed', [], 'SonataUserBundle')
            ->shouldBeCalled()
            ->willReturn('global.alert.already_email_confirmed');
        $flashBag
            ->set('sonata_user_success', 'global.alert.already_email_confirmed')
            ->shouldBeCalled();
        $this->emailAction(
            'unknowntoken',
            false,
            $userManager,
            $session,
            $loginManager,
            $router,
            $contributionManager
        );
    }

    public function it_can_confirm_an_email_of_a_valid_token(
        UserManager $userManager,
        Session $session,
        LoginManager $loginManager,
        FlashBagInterface $flashBag,
        Router $router,
        User $user,
        ContributionManager $contributionManager,
        TranslatorInterface $translator
    ) {
        $router->generate('app_homepage')->willReturn('/');
        $session->getFlashBag()->willReturn($flashBag);
        $userManager
            ->findUserByConfirmationToken('validtoken')
            ->shouldBeCalled()
            ->willReturn($user);
        $userManager
            ->updateUser($user)
            ->shouldBeCalled()
            ->willReturn(null);

        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setLastLogin(Argument::any())
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setConfirmationToken(null)
            ->shouldBeCalled()
            ->willReturn($user);

        $user->getPassword()->willReturn('already existing password');

        $contributionManager
            ->publishContributions($user)
            ->shouldBeCalled()
            ->willReturn(true);

        $translator
            ->trans('global.alert.email_confirmed_with_republish', [], 'SonataUserBundle')
            ->shouldBeCalled()
            ->willReturn('global.alert.email_confirmed_with_republish');
        $flashBag
            ->set('sonata_user_success', 'global.alert.email_confirmed_with_republish')
            ->shouldBeCalled();

        $this->emailAction(
            'validtoken',
            false,
            $userManager,
            $session,
            $loginManager,
            $router,
            $contributionManager
        );
    }

    public function it_can_not_confirm_a_new_email_of_unknown_token(
        UserManager $userManager,
        Session $session,
        LoginManager $loginManager,
        FlashBagInterface $flashBag,
        Router $router,
        User $user,
        ContributionManager $contributionManager,
        UserRepository $userRepo,
        TranslatorInterface $translator
    ) {
        $router->generate('app_homepage')->willReturn('/');
        $session->getFlashBag()->willReturn($flashBag);
        $userRepo
            ->findUserByNewEmailConfirmationToken('invalidtoken')
            ->shouldBeCalled()
            ->willReturn(null);
        $translator
            ->trans('global.alert.already_email_confirmed', [], 'SonataUserBundle')
            ->shouldBeCalled()
            ->willReturn('global.alert.already_email_confirmed');
        $flashBag
            ->set('sonata_user_success', 'global.alert.already_email_confirmed')
            ->shouldBeCalled();
        $this->newEmailAction(
            'invalidtoken',
            false,
            $userManager,
            $session,
            $loginManager,
            $router,
            $userRepo,
            $contributionManager
        );
    }

    public function it_can_confirm_a_new_email_of_a_not_confirmed_user(
        UserManager $userManager,
        Session $session,
        LoginManager $loginManager,
        FlashBagInterface $flashBag,
        Router $router,
        User $user,
        ContributionManager $contributionManager,
        UserRepository $userRepo,
        TranslatorInterface $translator
    ) {
        $router->generate('app_homepage')->willReturn('/');
        $session->getFlashBag()->willReturn($flashBag);
        $userRepo
            ->findUserByNewEmailConfirmationToken('validtoken')
            ->shouldBeCalled()
            ->willReturn($user);

        $user->getNewEmailToConfirm()->willReturn('newemail@gmail.com');
        $user
            ->setEmail('newemail@gmail.com')
            ->shouldBeCalled()
            ->willReturn($user);
        $user->setNewEmailConfirmationToken(null)->willReturn($user);
        $user->setNewEmailToConfirm(null)->willReturn($user);
        $user->isEmailConfirmed()->willReturn(false);

        $contributionManager
            ->publishContributions($user)
            ->shouldBeCalled()
            ->willReturn(true);
        $user
            ->setConfirmationToken(null)
            ->shouldBeCalled()
            ->willReturn($user);
        $user
            ->setEnabled(true)
            ->shouldBeCalled()
            ->willReturn($user);

        $userManager
            ->updateUser($user)
            ->shouldBeCalled()
            ->willReturn(null);
        $translator
            ->trans('global.alert.new_email_confirmed', [], 'SonataUserBundle')
            ->shouldBeCalled()
            ->willReturn('global.alert.new_email_confirmed');
        $flashBag->set('sonata_user_success', 'global.alert.new_email_confirmed')->shouldBeCalled();

        $this->newEmailAction(
            'validtoken',
            false,
            $userManager,
            $session,
            $loginManager,
            $router,
            $userRepo,
            $contributionManager
        );
    }
}
