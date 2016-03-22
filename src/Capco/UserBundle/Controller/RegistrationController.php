<?php

namespace Capco\UserBundle\Controller;

use Sonata\UserBundle\Controller\RegistrationFOSUser1Controller as BaseController;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * @Route("/register", defaults={"_feature_flags" = "registration"})
 */
class RegistrationController extends BaseController
{
    /**
     * @Route("/confirm/{token}", name="capco_user_registration_confirm")
     * Receive the confirmation token from user email provider, login the user
     */
    public function confirmAction($token)
    {
        $user = $this->container->get('fos_user.user_manager')->findUserByConfirmationToken($token);

        if (null === $user) {
            $this->container->get('session')->getFlashBag()->set('sonata_user_success', 'global.alert.already_enabled');

            return new RedirectResponse($this->container->get('router')->generate('app_homepage'));
        }

        $user->setConfirmationToken(null);
        $user->setEnabled(true);
        $user->setLastLogin(new \DateTime());
        $this->container->get('fos_user.user_manager')->updateUser($user);

        if ($redirectRoute = $this->container->getParameter('sonata.user.register.confirm.redirect_route')) {
            $response = new RedirectResponse($this->container->get('router')->generate($redirectRoute, $this->container->getParameter('sonata.user.register.confirm.redirect_route_params')));
        } else {
            $response = new RedirectResponse($this->container->get('router')->generate('fos_user_registration_confirmed'));
        }

        $this->authenticateUser($user, $response);

        return $response;
    }
}
