<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Capco\UserBundle\Handler\UserInvitationHandler;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class RegisterMutation implements MutationInterface
{
    public const EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED';
    public const EMAIL_DOMAIN_NOT_AUTHORIZED = 'EMAIL_DOMAIN_NOT_AUTHORIZED';
    public const CAPTCHA_INVALID = 'CAPTCHA_INVALID';
    public const REGISTER_FEATURE_NOT_ENABLED = 'REGISTER_FEATURE_NOT_ENABLED';
    public const USERNAME_BLANK = 'USERNAME_BLANK';
    public const EMAIL_BLANK = 'EMAIL_BLANK';
    public const PASSWORD_BLANK = 'PASSWORD_BLANK';
    public const EMAIL_THROWABLE = 'EMAIL_THROWABLE';
    public const NO_EXTRA_FIELDS = 'NO_EXTRA_FIELDS';

    private UserInviteRepository $userInviteRepository;
    private LoggerInterface $logger;
    private TranslatorInterface $translator;
    private UserManagerInterface $userManager;
    private Manager $toggleManager;
    private TokenGeneratorInterface $tokenGenerator;
    private FOSNotifier $notifier;
    private FormFactoryInterface $formFactory;
    private ResponsesFormatter $responsesFormatter;
    private UserInvitationHandler $userInvitationHandler;
    private PendingOrganizationInvitationRepository $organizationInvitationRepository;
    private EntityManagerInterface $em;

    public function __construct(
        Manager $toggleManager,
        UserInviteRepository $userInviteRepository,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        UserManagerInterface $userManager,
        TokenGeneratorInterface $tokenGenerator,
        FOSNotifier $notifier,
        FormFactoryInterface $formFactory,
        ResponsesFormatter $responsesFormatter,
        UserInvitationHandler $userInvitationHandler,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        EntityManagerInterface $em
    ) {
        $this->toggleManager = $toggleManager;
        $this->userInviteRepository = $userInviteRepository;
        $this->logger = $logger;
        $this->translator = $translator;
        $this->userManager = $userManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->notifier = $notifier;
        $this->formFactory = $formFactory;
        $this->responsesFormatter = $responsesFormatter;
        $this->userInvitationHandler = $userInvitationHandler;
        $this->organizationInvitationRepository = $organizationInvitationRepository;
        $this->em = $em;
    }

    public function __invoke(Argument $args): array
    {
        $data = $args->getArrayCopy();
        $invitationToken = $data['invitationToken'] ?? '';
        unset($data['invitationToken']);

        $invitation = $this->getInvitation($invitationToken, $data['email']);
        $organizationInvitation = $this->getInvitationFromOrganization(
            $invitationToken,
            $data['email']
        );

        if (!$this->isRegistrationAllowed($invitation, $organizationInvitation)) {
            // If the request is not made from an invitation and the feature toggle is not active
            // e.g traditional registration flow
            $message = sprintf(
                '%s (%s)',
                $this->translator->trans('error.feature_not_enabled', [], 'CapcoAppBundle'),
                'registration'
            );
            $this->logger->warning($message);

            return ['user' => null, 'errorsCode' => [self::REGISTER_FEATURE_NOT_ENABLED]];
        }

        /** @var User $user */
        $user = $this->userManager->createUser();
        $data = $this->setUserLocal($data, $user);

        $form = $this->formFactory->create(ApiRegistrationFormType::class, $user);
        if (isset($data['responses'])) {
            $data['responses'] = $this->responsesFormatter->format($data['responses']);
        }
        $form->submit($data, false);

        if (!$form->isValid()) {
            $errorsMap = [
                'already_used_email' => self::EMAIL_ALREADY_USED,
                'check_email.domain' => self::EMAIL_DOMAIN_NOT_AUTHORIZED,
                'recaptcha.invalid' => self::CAPTCHA_INVALID,
                'username.blank' => self::USERNAME_BLANK,
                'password.blank' => self::PASSWORD_BLANK,
                'email.blank' => self::EMAIL_BLANK,
                'email.throwable' => self::EMAIL_THROWABLE,
                'This form should not contain extra fields.' => self::NO_EXTRA_FIELDS,
            ];

            $errors = [];
            foreach ($form->getErrors(true) as $error) {
                $message = $error->getMessageTemplate();
                if (isset($errorsMap[$message])) {
                    $errors[] = $errorsMap[$message];
                }
            }

            return ['user' => null, 'errorsCode' => $errors];
        }

        $this->userManager->updatePassword($user);

        // This allow the user to login
        $user->setEnabled(true);

        if (!$invitation && !$organizationInvitation) {
            // We generate a confirmation token to validate email
            $token = $this->tokenGenerator->generateToken();
            $user->setConfirmationToken($token);
            $this->notifier->sendConfirmationEmailMessage($user);
        }

        if ($organizationInvitation instanceof PendingOrganizationInvitation) {
            $organization = $organizationInvitation->getOrganization();
            $role = $organizationInvitation->getRole();
            $memberOfOrganization = OrganizationMember::create($organization, $user, $role);
            $user->addMemberOfOrganization($memberOfOrganization);
            $this->em->remove($organizationInvitation);
        }

        $this->userInvitationHandler->handleUserInvite($user);
        $this->userInvitationHandler->handleUserOrganizationInvite($user);
        $this->userManager->updateUser($user);

        return ['user' => $user, 'errorsCode' => null];
    }

    private function getInvitation($invitationToken, $email): ?UserInvite
    {
        return $this->userInviteRepository->findOneByTokenNotExpiredAndEmail(
            $invitationToken,
            $email
        );
    }

    private function getInvitationFromOrganization(
        $invitationToken,
        $email
    ): ?PendingOrganizationInvitation {
        return $this->organizationInvitationRepository->findOneBy([
            'token' => $invitationToken,
            'email' => $email,
        ]);
    }

    private function isRegistrationAllowed(
        ?UserInvite $invitation,
        ?PendingOrganizationInvitation $organizationInvitation
    ): bool {
        $gotInvitation = $invitation || $organizationInvitation;

        return $gotInvitation || $this->toggleManager->isActive(Manager::registration);
    }

    private function setUserLocal(array $data, User $user): array
    {
        if ($this->toggleManager->isActive(Manager::multilangue)) {
            if (isset($data['locale']) && $data['locale']) {
                $user->setLocale($data['locale']);
            }
        }
        unset($data['locale']);

        return $data;
    }
}
