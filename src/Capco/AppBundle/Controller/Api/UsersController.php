<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\GraphQL\Mutation\Locale\SetUserDefaultLocaleMutation;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EmailDomainRepository;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Repository\GroupRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Helper\ResponsesFormatter;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\AbstractFOSRestController;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Capco\UserBundle\Form\Type\ApiAdminRegistrationFormType;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Encoder\EncoderFactoryInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UsersController extends AbstractFOSRestController
{
    private LoggerInterface $logger;
    private FOSNotifier $notifier;
    private Manager $toggleManager;
    private EncoderFactoryInterface $encoderFactory;
    private CommentRepository $commentRepository;
    private UserManagerInterface $userManager;
    private UserSearch $userSearch;
    private UserRepository $userRepository;
    private ResponsesFormatter $responsesFormatter;
    private TokenGeneratorInterface $tokenGenerator;
    private UserNotifier $userNotifier;
    private EmailDomainRepository $emailDomainRepository;
    private Publisher $publisher;
    private SetUserDefaultLocaleMutation $userDefaultLocaleMutation;

    public function __construct(
        LoggerInterface $logger,
        FOSNotifier $notifier,
        Manager $toggleManager,
        EncoderFactoryInterface $encoderFactory,
        CommentRepository $commentRepository,
        UserManagerInterface $userManager,
        UserSearch $userSearch,
        UserRepository $userRepository,
        ResponsesFormatter $responsesFormatter,
        TokenGeneratorInterface $tokenGenerator,
        UserNotifier $userNotifier,
        EmailDomainRepository $emailDomainRepository,
        Publisher $publisher,
        SetUserDefaultLocaleMutation $userDefaultLocaleMutation
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
        $this->userDefaultLocaleMutation = $userDefaultLocaleMutation;
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
            'anonymousComments' => $anonymousComments,
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
     * @Post("/users")
     * @View(statusCode=201, serializerGroups={"UserId"})
     */
    public function postUserAction(
        Request $request,
        UserInviteRepository $userInviteRepository,
        EntityManagerInterface $em,
        TranslatorInterface $translator,
        GroupRepository $groupRepository
    ) {
        $submittedData = $request->request->all();
        $invitationToken = $submittedData['invitationToken'] ?? '';
        unset($submittedData['postRegistrationScript'], $submittedData['invitationToken']);

        $invitation = $userInviteRepository->findOneByTokenNotExpiredAndEmail(
            $invitationToken,
            $submittedData['email']
        );

        if (!$invitation && !$this->toggleManager->isActive('registration')) {
            // If the request is not made from an invitation and the feature toggle is not active
            // e.g traditional registration flow
            $message = sprintf(
                '%s (%s)',
                $translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle'),
                'registration'
            );
            $this->logger->warning($message);

            throw new NotFoundHttpException($message);
        }

        /** @var User $user */
        $user = $this->userManager->createUser();

        if ($invitation) {
            foreach ($invitation->getGroups() as $group) {
                $userGroup = (new UserGroup())->setGroup($group)->setUser($user);
                $em->persist($userGroup);
            }
        }

        if ($this->toggleManager->isActive('multilangue')) {
            if (isset($submittedData['locale']) && $submittedData['locale']) {
                $user->setLocale($submittedData['locale']);
            } else {
                $user->setLocale($request->getLocale());
            }
        }
        unset($submittedData['locale']);

        if ($invitation) {
            if ($invitation->isProjectAdmin()) {
                $user->addRole(UserRole::ROLE_PROJECT_ADMIN);
            }
            if ($invitation->isAdmin()) {
                $user->addRole(UserRole::ROLE_ADMIN);
            }
        }

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

        if ($invitation) {
            // If the user has been invited by an admin, we auto confirm the user
            $user->setConfirmationToken(null)->setConfirmedAccountAt(new \DateTime());

            $em->remove($invitation);
        } else {
            // We generate a confirmation token to validate email
            $token = $this->tokenGenerator->generateToken();
            $user->setConfirmationToken($token);
            if ($creatingAnAdmin) {
                $this->userNotifier->adminConfirmation($user);
            } else {
                $this->notifier->sendConfirmationEmailMessage($user);
            }
        }

        $this->userManager->updateUser($user);

        return $user;
    }
}
