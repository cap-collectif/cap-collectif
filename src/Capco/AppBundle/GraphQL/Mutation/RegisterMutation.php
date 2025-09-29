<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Organization\OrganizationMember;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Utils\RequestGuesserInterface;
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
    use MutationTrait;

    final public const EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED';
    final public const EMAIL_DOMAIN_NOT_AUTHORIZED = 'EMAIL_DOMAIN_NOT_AUTHORIZED';
    final public const CAPTCHA_INVALID = 'CAPTCHA_INVALID';
    final public const REGISTER_FEATURE_NOT_ENABLED = 'REGISTER_FEATURE_NOT_ENABLED';
    final public const USERNAME_BLANK = 'USERNAME_BLANK';
    final public const EMAIL_BLANK = 'EMAIL_BLANK';
    final public const PASSWORD_BLANK = 'PASSWORD_BLANK';
    final public const EMAIL_THROWABLE = 'EMAIL_THROWABLE';
    final public const NO_EXTRA_FIELDS = 'NO_EXTRA_FIELDS';
    final public const RATE_LIMITER_ACTION = 'RegisterMutation';
    final public const RATE_LIMIT_REACHED = 'RATE_LIMIT_REACHED';

    public function __construct(
        private readonly Manager $toggleManager,
        private readonly UserInviteRepository $userInviteRepository,
        private readonly LoggerInterface $logger,
        private readonly TranslatorInterface $translator,
        private readonly UserManagerInterface $userManager,
        private readonly TokenGeneratorInterface $tokenGenerator,
        private readonly FOSNotifier $notifier,
        private readonly FormFactoryInterface $formFactory,
        private readonly ResponsesFormatter $responsesFormatter,
        private readonly UserInvitationHandler $userInvitationHandler,
        private readonly PendingOrganizationInvitationRepository $organizationInvitationRepository,
        private readonly EntityManagerInterface $em,
        private readonly RateLimiter $rateLimiter,
        private readonly RequestGuesserInterface $requestGuesser
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $this->rateLimiter->setLimit(3);

        if (
            false ===
            $this->rateLimiter->canDoAction(
                self::RATE_LIMITER_ACTION,
                $this->requestGuesser->getClientIp()
            )
        ) {
            return [
                'user' => null,
                'errorsCode' => [self::RATE_LIMIT_REACHED],
            ];
        }

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
