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
        $manager->updateUser($user);

        $this->get('fos_user.security.login_manager')->loginUser(
            $this->container->getParameter('fos_user.firewall_name'),
            $user,
            $response
        );

        $this->container->get('session')->getFlashBag()->set('sonata_user_success', 'global.alert.email_confirmed');

        return $response;
    }
}
