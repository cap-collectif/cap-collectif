<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\GraphQL\Resolver\User\UserResettingPasswordUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserResettingPasswordMessage;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\RecreatePasswordFormType;
use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;
use Symfony\Contracts\Translation\TranslatorInterface;

class ResettingController extends AbstractController
{
    private const SESSION_EMAIL = 'fos_user_send_resetting_email/email';

    public function __construct(
        private readonly TokenGenerator $tokenGenerator,
        private readonly MailerService $mailerService,
        private readonly UserManager $userManager,
        private readonly FormFactoryInterface $formFactory,
        private readonly SessionInterface $session,
        private readonly RouterInterface $router,
        private readonly UserResettingPasswordUrlResolver $userResettingPasswordUrlResolver,
        private readonly UserPasswordEncoderInterface $userPasswordEncoder,
        private readonly TranslatorInterface $translator,
        private readonly \Twig\Environment $twig,
        private readonly LoginManagerInterface $loginManager
    ) {
    }

    public function requestAction(): Response
    {
        return $this->render('@CapcoUser/Resetting/request.html.twig');
    }

    public function resetAction(Request $request, ?string $token): Response
    {
        $user = $this->userManager->findUserByResetPasswordToken($token);
        if (null === $user) {
            throw new NotFoundHttpException(sprintf('The user with "confirmation token" does not exist for value "%s"', $token));
        }
        if (
            !$user->isPasswordRequestNonExpired(
                $this->container->getParameter('fos_user.resetting.token_ttl')
            )
        ) {
            return new RedirectResponse($this->router->generate('fos_user_resetting_request'));
        }

        $form = $this->formFactory->create(RecreatePasswordFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $password = $this->userPasswordEncoder->encodePassword(
                $user,
                $user->getPlainPassword()
            );
            $user->setPassword($password);
            $this->getDoctrine()
                ->getManager()
                ->flush()
            ;
            $this->addFlash(
                'fos_user_success',
                $this->translator->trans('resetting.flash.success', [], 'CapcoAppBundle')
            );

            $response = new RedirectResponse($this->getRedirectionUrl($user));
            $this->authenticateUser($user, $response);

            return $response;
        }

        $render = $this->twig->render('@CapcoUser/Resetting/reset.html.twig', [
            'token' => $token,
            'form' => $form->createView(),
        ]);
        $response = new Response();
        $response->setContent($render);

        return $response;
    }

    /**
     * Request reset user password: submit form and send email.
     */
    public function sendEmailAction(Request $request): Response
    {
        $email = $request->request->get('email');
        $errors = $this->get('validator')->validate($email, new EmailConstraint());

        if (\count($errors) > 0) {
            $render = $this->twig->render('@CapcoUser/Resetting/request.html.twig', [
                'invalid_email' => $email,
            ]);

            return (new Response())->setContent($render);
        }
        /** @var User $user */
        $user = $this->userManager->findUserByEmail($email);

        if (
            null !== $user
            && !$user->isPasswordRequestNonExpired(
                $this->container->getParameter('fos_user.resetting.token_ttl')
            )
        ) {
            if (null === $user->getResetPasswordToken()) {
                $token = $this->tokenGenerator->generateToken();
                $user->setResetPasswordToken($token);
            }

            $this->session->set(static::SESSION_EMAIL, $email);

            $this->mailerService->createAndSendMessage(
                UserResettingPasswordMessage::class,
                $user,
                ['confirmationURL' => $this->userResettingPasswordUrlResolver->__invoke($user)],
                $user
            );
            $user->setPasswordRequestedAt(new \DateTime());
            $this->userManager->updateUser($user);
        }

        $this->session->set(static::SESSION_EMAIL, $email);

        return new RedirectResponse($this->router->generate('fos_user_resetting_check_email'));
    }

    /**
     * Tell the user to check his email provider.
     */
    public function checkEmailAction(Request $request): Response
    {
        $email = $this->session->get(static::SESSION_EMAIL);
        $this->session->remove(static::SESSION_EMAIL);

        return $this->render('@CapcoUser/Resetting/checkEmail.html.twig', ['email' => $email]);
    }

    /**
     * Generate the redirection url when the resetting is completed.
     */
    protected function getRedirectionUrl(UserInterface $user): string
    {
        return $this->router->generate('app_homepage');
    }

    /**
     * Authenticate a user with Symfony Security.
     */
    protected function authenticateUser(UserInterface $user, Response $response): void
    {
        try {
            $this->loginManager->logInUser(
                $this->container->getParameter('fos_user.firewall_name'),
                $user,
                $response
            );
        } catch (AccountStatusException) {
            // We simply do not authenticate users which do not pass the user
            // checker (not enabled, locked, etc.).
        }
    }
}
