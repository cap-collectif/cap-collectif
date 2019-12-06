<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Util\TokenGenerator;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Helper\ResponsesFormatter;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Capco\UserBundle\Form\Type\ApiProfileAccountFormType;
use Capco\UserBundle\Form\Type\ApiAdminRegistrationFormType;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Security\Core\Encoder\EncoderFactory;

class UsersController extends AbstractFOSRestController
{
    private $logger;
    private $notifier;
    private $toggleManager;
    private $encoderFactory;
    private $commentRepository;
    private $userManager;
    private $userSearch;
    private $userRepository;
    private $responsesFormatter;
    private $tokenGenerator;
    private $userNotifier;
    private $emailDomainRepository;
    private $publisher;

    public function __construct(
        LoggerInterface $logger,
        FOSNotifier $notifier,
        Manager $toggleManager,
        EncoderFactory $encoderFactory,
        CommentRepository $commentRepository,
        UserManagerInterface $userManager,
        UserSearch $userSearch,
        UserRepository $userRepository,
        ResponsesFormatter $responsesFormatter,
        TokenGenerator $tokenGenerator,
        UserNotifier $userNotifier,
        EmailDomainRepository $emailDomainRepository,
        Publisher $publisher
    ) {
        $this->logger = $logger;
        $this->notifier = $notifier;
        $this->toggleManager = $toggleManager;
        $this->encoderFactory = $encoderFactory;
        $this->commentRepository = $commentRepository;
        $this->userManager = $userManager;
        $this->userSearch = $userSearch;
        $this->userRepository = $userRepository;
        $this->responsesFormatter = $responsesFormatter;
        $this->tokenGenerator = $tokenGenerator;
        $this->userNotifier = $userNotifier;
        $this->emailDomainRepository = $emailDomainRepository;
        $this->publisher = $publisher;
    }

    /**
     * @Get("/users_counters")
     * @View()
     */
    public function getUsersCountersAction()
    {
        $registeredContributorCount = $this->userRepository->getRegisteredContributorCount();
        $anonymousComments = $this->commentRepository->getAnonymousCount();

        return [
            'contributors' => $registeredContributorCount + $anonymousComments,
            'registeredContributors' => $registeredContributorCount,
            'anonymousComments' => $anonymousComments
        ];
    }

    /**
     * @Post("/users/search")
     * @View(statusCode=200, serializerGroups={"UserId", "UsersInfos"})
     */
    public function getUsersSearchAction(Request $request)
    {
        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;
        $notInIds = $request->request->has('notInIds') ? $request->request->get('notInIds') : null;

        return $this->userSearch->searchAllUsers($terms, $notInIds);
    }

    /**
     * Create a user.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create a user.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *  }
     * )
     *
     * @Post("/users", defaults={"_feature_flags" = "registration"})
     * @View(statusCode=201, serializerGroups={"UserId"})
     */
    public function postUserAction(Request $request)
    {
        $submittedData = $request->request->all();
        unset($submittedData['postRegistrationScript']);
        /** @var User $user */
        $user = $this->userManager->createUser();

        $creatingAnAdmin = $this->getUser() && $this->getUser()->isAdmin();

        $formClass = $creatingAnAdmin
            ? ApiAdminRegistrationFormType::class
            : ApiRegistrationFormType::class;

        $form = $this->createForm($formClass, $user);
        if (isset($submittedData['responses'])) {
            $submittedData['responses'] = $this->responsesFormatter->format(
                $submittedData['responses']
            );
        }

        $form->submit($submittedData, false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->userManager->updatePassword($user);

        // This allow the user to login
        $user->setEnabled(true);

        // We generate a confirmation token to validate email
        $token = $this->tokenGenerator->generateToken();
        $user->setConfirmationToken($token);
        if ($creatingAnAdmin) {
            $this->userNotifier->adminConfirmation($user);
        } else {
            $this->notifier->sendConfirmationEmailMessage($user);
        }

        $this->userManager->updateUser($user);

        return $user;
    }

    /**
     * @Put("/users/me")
     * @View(statusCode=204, serializerGroups={})
     */
    public function putMeAction(Request $request)
    {
        $user = $this->getUser();
        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($request->request->has('phone')) {
            return $this->updatePhone($request);
        }
        if ($request->request->has('email')) {
            return $this->updateEmail($request);
        }
    }

    /**
     * @Post("/account/cancel_email_change")
     * @View(statusCode=200, serializerGroups={})
     */
    public function cancelEmailChangeAction()
    {
        $user = $this->getUser();
        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $user->setNewEmailToConfirm(null);
        $user->setNewEmailConfirmationToken(null);
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }

    /**
     * @Post("/account/resend_confirmation_email", defaults={"_feature_flags" = "registration"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postResendEmailConfirmationAction()
    {
        /** @var User $user */
        $user = $this->getUser();

        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($user->isEmailConfirmed() && !$user->getNewEmailToConfirm()) {
            $this->logger->warning('Already confirmed.');

            return new JsonResponse(['message' => 'Already confirmed.', 'code' => 400], 400);
        }

        // security against mass click email resend
        if ($user->getEmailConfirmationSentAt() > (new \DateTime())->modify('- 1 minutes')) {
            $this->logger->warning('Email already sent less than a minute ago.');

            return new JsonResponse(
                ['message' => 'Email already sent less than a minute ago.', 'code' => 400],
                400
            );
        }

        if ($user->getNewEmailToConfirm()) {
            $this->get('swarrot.publisher')->publish(
                'user.email',
                new Message(
                    json_encode([
                        'userId' => $user->getId()
                    ])
                )
            );
        } else {
            $this->notifier->sendConfirmationEmailMessage($user);
        }

        $user->setEmailConfirmationSentAt(new \DateTime());
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }

    private function updateEmail(Request $request)
    {
        $user = $this->getUser();
        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }
        $newEmailToConfirm = $request->request->get('email');
        $password = $request->request->get('password');

        $encoder = $this->encoderFactory->getEncoder($user);
        if (!$encoder->isPasswordValid($user->getPassword(), $password, $user->getSalt())) {
            return new JsonResponse(
                ['message' => 'You must specify your password to update your email.'],
                400
            );
        }

        if ($this->userRepository->findOneByEmail($newEmailToConfirm)) {
            return new JsonResponse(['message' => 'Already used email.'], 400);
        }

        if (
            $this->toggleManager->isActive('restrict_registration_via_email_domain') &&
            !$this->emailDomainRepository->findOneBy([
                'value' => explode('@', $newEmailToConfirm)[1]
            ])
        ) {
            return new JsonResponse(['message' => 'Unauthorized email domain.'], 400);
        }

        $form = $this->createForm(ApiProfileAccountFormType::class, $user);
        $form->submit(['newEmailToConfirm' => $newEmailToConfirm], false);

        if (!$form->isValid()) {
            return $form;
        }

        // We generate a confirmation token to validate the new email
        $token = $this->tokenGenerator->generateToken();

        $this->publisher->publish(
            'user.email',
            new Message(
                json_encode([
                    'userId' => $user->getId()
                ])
            )
        );

        $user->setNewEmailConfirmationToken($token);
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }
}
