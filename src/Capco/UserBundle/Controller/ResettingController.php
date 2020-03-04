<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\GraphQL\Resolver\User\UserResettingPasswordUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserResettingPasswordMessage;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\RecreatePasswordFormType;
use FOS\UserBundle\Form\Factory\FactoryInterface;
use FOS\UserBundle\Mailer\Mailer;
use FOS\UserBundle\Model\UserInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Exception\AccountStatusException;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;

class ResettingController extends \FOS\UserBundle\Controller\ResettingController
{
    private const SESSION_EMAIL = 'fos_user_send_resetting_email/email';

    private $tokenGenerator;
    private $mailer;
    private $mailerService;
    private $userManager;
    private $eventDispatcher;
    private $formFactory;
    private $session;
    private $router;
    private $userResettingPasswordUrlResolver;

    /**
     * @var int
     */
    private $retryTtl;

    public function __construct(
        TokenGenerator $tokenGenerator,
        Mailer $mailer,
        MailerService $mailerService,
        UserManager $userManager,
        EventDispatcherInterface $eventDispatcher,
        FactoryInterface $formFactory,
        SessionInterface $session,
        $retryTtl,
        RouterInterface $router,
        UserResettingPasswordUrlResolver $userResettingPasswordUrlResolver
    ) {
        $this->eventDispatcher = $eventDispatcher;
        $this->formFactory = $formFactory;
        $this->userManager = $userManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->mailer = $mailer;
        $this->mailerService = $mailerService;
        $this->retryTtl = $retryTtl;
        $this->session = $session;
        $this->router = $router;
        $this->userResettingPasswordUrlResolver = $userResettingPasswordUrlResolver;
        parent::__construct(
            $eventDispatcher,
            $formFactory,
            $userManager,
            $tokenGenerator,
            $mailer,
            $retryTtl
        );
    }

    public function requestAction()
    {
        return $this->render('CapcoUserBundle:Resetting:request.html.twig');
    }

    public function resetAction(Request $request, $token)
    {
        /** @var User $user */
        $user = $this->userManager->findUserByResetPasswordToken($token);
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
            return new RedirectResponse($this->router->generate('fos_user_resetting_request'));
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
            $this->addFlash(
                'fos_user_success',
                $this->get('translator')->trans('resetting.flash.success', [], 'CapcoAppBundle')
            );

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
                $token = $this->tokenGenerator->generateToken();
                $user->setResetPasswordToken($token);
                $user->setConfirmationToken($token);
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
    public function checkEmailAction(Request $request)
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
            $this->container
                ->get('capco.fos_user.security.login_manager')
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
