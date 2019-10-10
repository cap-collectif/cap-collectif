<?php

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\RecreatePasswordFormType;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;

class ResettingFOSUser1Controller extends Controller
{
    const SESSION_EMAIL = 'fos_user_send_resetting_email/email';

    public function requestAction()
    {
        return $this->container
            ->get('templating')
            ->renderResponse('CapcoUserBundle:Resetting:request.html.twig');
    }

    public function resetAction(Request $request, string $token)
    {
        /** @var User $user */
        $user = $this->container->get(UserManager::class)->findUserByResetPasswordToken($token);
        if (null === $user) {
            throw new NotFoundHttpException(
                sprintf('The user with "confirmation token" does not exist for value "%s"', $token)
            );
        }
        if (
            !$user->isPasswordRequestNonExpired(
                $this->container->getParameter('fos_user.resetting.token_ttl')
            )
        ) {
            return new RedirectResponse(
                $this->container->get('router')->generate('fos_user_resetting_request')
            );
        }

        $form = $this->createForm(RecreatePasswordFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $password = $this->get('security.password_encoder')->encodePassword(
                $user,
                $user->getPlainPassword()
            );
            $user->setPassword($password);
            $this->getDoctrine()
                ->getManager()
                ->flush();
            $this->addFlash('fos_user_success', 'resetting.flash.success');
            $response = new RedirectResponse($this->getRedirectionUrl($user));
            $this->authenticateUser($user, $response);

            return $response;
        }

        return $this->container
            ->get('templating')
            ->renderResponse('@CapcoUser/Resetting/reset.html.twig', [
                'token' => $token,
                'form' => $form->createView()
            ]);
    }

    /**
     * Request reset user password: submit form and send email.
     */
    public function sendEmailAction(Request $request)
    {
        $email = $request->request->get('email');
        $errors = $this->container->get('validator')->validate($email, new EmailConstraint());

        if (\count($errors) > 0) {
            return $this->container
                ->get('templating')
                ->renderResponse('CapcoUserBundle:Resetting:request.html.twig', [
                    'invalid_email' => $email
                ]);
        }
        /** @var User $user */
        $user = $this->container->get(UserManager::class)->findUserByEmail($email);

        if (
            null !== $user &&
            !$user->isPasswordRequestNonExpired(
                $this->container->getParameter('fos_user.resetting.token_ttl')
            )
        ) {
            if (null === $user->getResetPasswordToken()) {
                $tokenGenerator = $this->container->get('fos_user.util.token_generator');
                $user->setResetPasswordToken($tokenGenerator->generateToken());
            }

            $this->container->get('session')->set(static::SESSION_EMAIL, $email);
            $this->container->get('fos_user.mailer')->sendResettingEmailMessage($user);
            $user->setPasswordRequestedAt(new \DateTime());
            $this->container->get('fos_user.user_manager')->updateUser($user);
        }

        $this->container->get('session')->set(static::SESSION_EMAIL, $email);

        return new RedirectResponse(
            $this->container->get('router')->generate('fos_user_resetting_check_email')
        );
    }

    /**
     * Tell the user to check his email provider.
     */
    public function checkEmailAction()
    {
        $session = $this->container->get('session');
        $email = $session->get(static::SESSION_EMAIL);
        $session->remove(static::SESSION_EMAIL);

        return $this->container
            ->get('templating')
            ->renderResponse('@CapcoUser/Resetting/checkEmail.html.twig', ['email' => $email]);
    }

    /**
     * Generate the redirection url when the resetting is completed.
     *
     * @param \FOS\UserBundle\Model\UserInterface $user
     *
     * @return string
     */
    protected function getRedirectionUrl(UserInterface $user): string
    {
        return $this->container->get('router')->generate('app_homepage');
    }

    /**
     * Authenticate a user with Symfony Security.
     *
     * @param \FOS\UserBundle\Model\UserInterface        $user
     * @param \Symfony\Component\HttpFoundation\Response $response
     */
    protected function authenticateUser(UserInterface $user, Response $response): void
    {
        try {
            $this->container
                ->get('fos_user.security.login_manager')
                ->logInUser(
                    $this->container->getParameter('fos_user.firewall_name'),
                    $user,
                    $response
                );
        } catch (AccountStatusException $ex) {
            // We simply do not authenticate users which do not pass the user
            // checker (not enabled, locked, etc.).
        }
    }
}
