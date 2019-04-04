<?php

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Security\LoginManagerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\RouterInterface;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Manager\ContributionManager;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ConfirmationController extends Controller
{
    private $userManager;
    private $loginManager;
    private $router;
    private $contributionManager;
    private $session;
    private $userRepo;

    public function __construct(
        UserManager $userManager,
        LoginManagerInterface $loginManager,
        RouterInterface $router,
        SessionInterface $session,
        ContributionManager $contributionManager,
        UserRepository $userRepo
    ) {
        $this->userManager = $userManager;
        $this->loginManager = $loginManager;
        $this->router = $router;
        $this->contributionManager = $contributionManager;
        $this->session = $session;
        $this->userRepo = $userRepo;
        $this->login = true;
    }

    /**
     * @Route("/account/email_confirmation/{token}", name="account_confirm_email")
     * @Route("/email-confirmation/{token}", name="account_confirm_email_legacy")
     */
    public function emailAction(string $token): RedirectResponse
    {
        $response = new RedirectResponse($this->router->generate('app_homepage'));

        // We create a session for flashBag
        $flashBag = $this->session->getFlashBag();

        /** @var User $user */
        $user = $this->userManager->findUserByConfirmationToken($token);

        if (!$user) {
            // We could not find a user with this token
            $flashBag->set('sonata_user_success', 'global.alert.already_email_confirmed');

            return $response;
        }

        $user->setEnabled(true);
        $user->setLastLogin(new \DateTime());

        $hasPublishedContributions = $this->confirmUser($user);

        // If user has been created via API he has no password yet.
        // That's why we create a reset password request to let him chose a password
        if (null === $user->getPassword()) {
            $user->setPasswordRequestedAt(new \DateTime());

            // This will flush
            $this->userManager->updateUser($user);

            return $this->redirectToRoute('fos_user_resetting_reset', [
                'token' => $user->getResetPasswordToken(),
            ]);
        }

        // This will flush
        $this->userManager->updateUser($user);

        if ($this->login) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        $flashBag->set(
            'sonata_user_success',
            $hasPublishedContributions
                ? 'global.alert.email_confirmed_with_republish'
                : 'global.alert.email_confirmed'
        );

        return $response;
    }

    /**
     * @Route("/account/new_email_confirmation/{token}", name="account_confirm_new_email")
     */
    public function newEmailAction(string $token): RedirectResponse
    {
        $response = new RedirectResponse($this->router->generate('app_homepage'));

        // We create a session for flashBag
        $flashBag = $this->session->getFlashBag();

        $user = $this->userRepo->findUserByNewEmailConfirmationToken($token);

        if (!$user) {
            // We could not find a user with this token
            $flashBag->set('sonata_user_success', 'global.alert.already_email_confirmed');

            return $response;
        }

        $user->setEmail($user->getNewEmailToConfirm());
        $user->setNewEmailConfirmationToken(null);
        $user->setNewEmailToConfirm(null);

        // We must confirm the user, in case he isn't verified yet
        // it happen when a user update his email without
        // confirming his first email.
        if (!$user->isEmailConfirmed()) {
            $this->confirmUser($user);
        }

        // This will flush
        $this->userManager->updateUser($user);

        if ($this->login) {
            $this->loginManager->loginUser('main', $user, $response);
        }

        $flashBag->set('sonata_user_success', 'global.alert.new_email_confirmed');

        return $response;
    }

    /**
     * Handle the confirmation of a user logic.
     */
    private function confirmUser(User $user): bool
    {
        // We publish the user's contributions
        $hasPulishedContributions = $this->contributionManager->publishContributions($user);

        // We can confirm by email the user
        $user->setConfirmationToken(null);
        $user->setEnabled(true);

        return $hasPulishedContributions;
    }
}
