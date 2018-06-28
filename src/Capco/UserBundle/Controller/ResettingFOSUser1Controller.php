<?php

namespace Capco\UserBundle\Controller;

use FOS\UserBundle\Model\UserInterface;
use Sonata\UserBundle\Controller\ResettingFOSUser1Controller as BaseController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;

class ResettingFOSUser1Controller extends BaseController
{
    public function requestAction()
    {
        return $this->container->get('templating')->renderResponse('CapcoUserBundle:Resetting:request.html.twig');
    }

    /**
     * Request reset user password: submit form and send email.
     */
    public function sendEmailAction()
    {
        $email = $this->container->get('request')->request->get('email');
        $errors = $this->container->get('validator')->validate($email, new EmailConstraint());

        if (\count($errors) > 0) {
            return $this->container->get('templating')->renderResponse('CapcoUserBundle:Resetting:request.html.twig', ['invalid_email' => $email]);
        }

        $user = $this->container->get('fos_user.user_manager')->findUserByEmail($email);

        if (null !== $user && !$user->isExpired() && !$user->isPasswordRequestNonExpired($this->container->getParameter('fos_user.resetting.token_ttl'))) {
            if (null === $user->getConfirmationToken()) {
                $tokenGenerator = $this->container->get('fos_user.util.token_generator');
                $user->setConfirmationToken($tokenGenerator->generateToken());
            }

            $this->container->get('session')->set(static::SESSION_EMAIL, $email);
            $this->container->get('fos_user.mailer')->sendResettingEmailMessage($user);
            $user->setPasswordRequestedAt(new \DateTime());
            $this->container->get('fos_user.user_manager')->updateUser($user);
        }

        $this->container->get('session')->set(static::SESSION_EMAIL, $email);

        return new RedirectResponse($this->container->get('router')->generate('fos_user_resetting_check_email'));
    }

    /**
     * Tell the user to check his email provider.
     */
    public function checkEmailAction()
    {
        $session = $this->container->get('session');
        $email = $session->get(static::SESSION_EMAIL);
        $session->remove(static::SESSION_EMAIL);

        return $this->container->get('templating')->renderResponse('FOSUserBundle:Resetting:checkEmail.html.twig', [
            'email' => $email,
        ]);
    }

    protected function getRedirectionUrl(UserInterface $user)
    {
        return $this->container->get('router')->generate('app_homepage');
    }
}
