<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Search\UserSearch;
use Capco\AppBundle\Sms\SmsService;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Helper\ResponsesFormatter;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Capco\UserBundle\Form\Type\ApiProfileFormType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Capco\UserBundle\Form\Type\ApiProfileAccountFormType;
use Capco\UserBundle\Form\Type\ApiAdminRegistrationFormType;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class UsersController extends AbstractFOSRestController
{
    /**
     * @Get("/users_counters")
     * @View()
     */
    public function getUsersCountersAction()
    {
        $registeredContributorCount = $this->get(
            UserRepository::class
        )->getRegisteredContributorCount();
        $anonymousComments = $this->get(CommentRepository::class)->getAnonymousCount();

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

        return $this->get(UserSearch::class)->searchAllUsers($terms, $notInIds);
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
        $userManager = $this->get('fos_user.user_manager');
        /** @var User $user */
        $user = $userManager->createUser();

        $creatingAnAdmin = $this->getUser() && $this->getUser()->isAdmin();

        $formClass = $creatingAnAdmin
            ? ApiAdminRegistrationFormType::class
            : ApiRegistrationFormType::class;

        $form = $this->createForm($formClass, $user);
        if (isset($submittedData['responses'])) {
            $submittedData['responses'] = $this->get(ResponsesFormatter::class)->format(
                $submittedData['responses']
            );
        }

        $form->submit($submittedData, false);

        if (!$form->isValid()) {
            return $form;
        }

        $userManager->updatePassword($user);

        // This allow the user to login
        $user->setEnabled(true);

        // We generate a confirmation token to validate email
        $token = $this->get('fos_user.util.token_generator')->generateToken();
        $user->setConfirmationToken($token);
        if ($creatingAnAdmin) {
            $this->get(UserNotifier::class)->adminConfirmation($user);
        } else {
            $this->get(FOSNotifier::class)->sendConfirmationEmailMessage($user);
        }

        $userManager->updateUser($user);

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
        /** @var LoggerInterface $logger */
        $logger = $this->get('logger');

        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($user->isEmailConfirmed() && !$user->getNewEmailToConfirm()) {
            $logger->warning('Already confirmed.');

            return new JsonResponse(['message' => 'Already confirmed.', 'code' => 400], 400);
        }

        // security against mass click email resend
        if ($user->getEmailConfirmationSentAt() > (new \DateTime())->modify('- 1 minutes')) {
            $logger->warning('Email already sent less than a minute ago.');

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
            $this->get(FOSNotifier::class)->sendConfirmationEmailMessage($user);
        }

        $user->setEmailConfirmationSentAt(new \DateTime());
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }

    /**
     * @Post("/send-sms-confirmation", defaults={"_feature_flags" = "phone_confirmation"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSendSmsConfirmationAction()
    {
        /** @var User $user */
        $user = $this->getUser();
        /** @var LoggerInterface $logger */
        $logger = $this->get('logger');

        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }
        if ($user->isPhoneConfirmed()) {
            $logger->warning('Already confirmed.');

            return new JsonResponse(['message' => 'Already confirmed.', 'code' => 400], 400);
        }

        if (!$user->getPhone()) {
            throw new BadRequestHttpException('No phone.');
        }

        // security against mass click sms resend
        if (
            $user->getSmsConfirmationSentAt() &&
            $user->getSmsConfirmationSentAt() > (new \DateTime())->modify('- 3 minutes')
        ) {
            throw new BadRequestHttpException('sms_already_sent_recently');
        }

        try {
            $this->get(SmsService::class)->confirm($user);
        } catch (\Services_Twilio_RestException $e) {
            $this->get('logger')->error($e->getMessage());

            throw new BadRequestHttpException('sms_failed_to_send');
        }

        $user->setSmsConfirmationSentAt(new \DateTime());
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }

    /**
     * @Post("/sms-confirmation", defaults={"_feature_flags" = "phone_confirmation"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postSmsConfirmationAction(Request $request)
    {
        /** @var User $user */
        $user = $this->getUser();
        /** @var LoggerInterface $logger */
        $logger = $this->get('logger');

        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        if ($user->isPhoneConfirmed()) {
            $logger->warning('Already confirmed.');

            return new JsonResponse(['message' => 'Already confirmed.', 'code' => 400], 400);
        }

        if (!$user->getSmsConfirmationCode()) {
            throw new BadRequestHttpException('Ask a confirmation message before.');
        }

        if ($request->request->get('code') !== $user->getSmsConfirmationCode()) {
            throw new BadRequestHttpException('sms_code_invalid');
        }

        $user->setPhoneConfirmed(true);
        $user->setSmsConfirmationSentAt(null);
        $user->setSmsConfirmationCode(null);
        $this->getDoctrine()
            ->getManager()
            ->flush();
    }

    private function updatePhone(Request $request)
    {
        $user = $this->getUser();
        if (!$user || 'anon.' === $user) {
            throw new AccessDeniedHttpException('Not authorized.');
        }
        $previousPhone = $user->getPhone();
        $form = $this->createForm(ApiProfileFormType::class, $user);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        // If phone is updated we have to make sure it's sms confirmed again
        if (null !== $previousPhone && $previousPhone !== $user->getPhone()) {
            $user->setPhoneConfirmed(false);
            // TODO: security breach user can send unlimited sms if he change his number
            $user->setSmsConfirmationSentAt(null);
        }

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
        $toggleManager = $this->container->get(Manager::class);

        $encoder = $this->get('security.encoder_factory')->getEncoder($user);
        if (!$encoder->isPasswordValid($user->getPassword(), $password, $user->getSalt())) {
            return new JsonResponse(
                ['message' => 'You must specify your password to update your email.'],
                400
            );
        }

        if ($this->container->get(UserRepository::class)->findOneByEmail($newEmailToConfirm)) {
            return new JsonResponse(['message' => 'Already used email.'], 400);
        }

        if (
            $toggleManager->isActive('restrict_registration_via_email_domain') &&
            !$this->container->get(EmailDomainRepository::class)->findOneBy([
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
        $token = $this->get('fos_user.util.token_generator')->generateToken();

        $this->get('swarrot.publisher')->publish(
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
