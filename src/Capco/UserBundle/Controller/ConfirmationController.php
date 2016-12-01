<?php

namespace Capco\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\RedirectResponse;

class ConfirmationController extends Controller
{
    /**
     * @Route("/email-confirmation/{token}", defaults={"_feature_flags" = "registration"})
     */
    public function emailAction($token)
    {
        $manager = $this->container->get('fos_user.user_manager');
        $user = $manager->findUserByConfirmationToken($token);
        $response = new RedirectResponse($this->container->get('router')->generate('app_homepage'));

        if (!$user) {
            $this->container->get('session')->getFlashBag()->set('sonata_user_success', 'global.alert.already_email_confirmed');

            return $response;
        }

        $user->setConfirmationToken(null);
        $user->setEnabled(true);
        $user->setExpired(false);
        $user->setExpiresAt(null);
        $user->setLastLogin(new \DateTime());
        $hasRepublishedContributions = $this->get('capco.contribution.manager')->republishContributions($user);
        $manager->updateUser($user);

        // if user has been created via API he has no password yet.
        // That's why we create a reset password request to let him chose a password
        if ($user->getPassword() === null) {
            $token = $this->container->get('fos_user.util.token_generator')->generateToken();
            $user->setPasswordRequestedAt(new \DateTime());
            $user->setConfirmationToken($token);
            $manager->updateUser($user);
            // We send a mail so that user can reset password after if link is lost
            $this->container->get('fos_user.mailer')->sendResettingEmailMessage($user);
            return $this->redirect('fos_user_resetting_reset', ['token' => $token]);
        }

        $this->get('fos_user.security.login_manager')->loginUser(
            $this->container->getParameter('fos_user.firewall_name'),
            $user,
            $response
        );

        if ($hasRepublishedContributions) {
            $this->container->get('session')->getFlashBag()->set('sonata_user_success', 'global.alert.email_confirmed_with_republish');
        } else {
            $this->container->get('session')->getFlashBag()->set('sonata_user_success', 'global.alert.email_confirmed');
        }

        return $response;
    }
}
