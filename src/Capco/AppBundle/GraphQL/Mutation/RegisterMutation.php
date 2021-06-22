<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Helper\ResponsesFormatter;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Form\Type\ApiAdminRegistrationFormType;
use Capco\UserBundle\Form\Type\ApiRegistrationFormType;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Model\UserManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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
    private EntityManagerInterface $em;
    private ResponsesFormatter $responsesFormatter;

    public function __construct(
        Manager $toggleManager,
        UserInviteRepository $userInviteRepository,
        LoggerInterface $logger,
        TranslatorInterface $translator,
        UserManagerInterface $userManager,
        TokenGeneratorInterface $tokenGenerator,
        FOSNotifier $notifier,
        FormFactoryInterface $formFactory,
        EntityManagerInterface $em,
        ResponsesFormatter $responsesFormatter
    ) {
        $this->toggleManager = $toggleManager;
        $this->userInviteRepository = $userInviteRepository;
        $this->logger = $logger;
        $this->translator = $translator;
        $this->userManager = $userManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->notifier = $notifier;
        $this->formFactory = $formFactory;
        $this->em = $em;
        $this->responsesFormatter = $responsesFormatter;
    }

    public function __invoke(Argument $args)
    {
        $data = $args->getArrayCopy();
        $invitationToken = $data['invitationToken'] ?? '';
        unset($data['invitationToken']);

        $invitation = $this->userInviteRepository->findOneByTokenNotExpiredAndEmail(
            $invitationToken,
            $data['email']
        );

        if (!$invitation && !$this->toggleManager->isActive('registration')) {
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

        if ($this->toggleManager->isActive('multilangue')) {
            if (isset($data['locale']) && $data['locale']) {
                $user->setLocale($data['locale']);
            }
        }
        unset($data['locale']);

        if ($invitation && $invitation->isAdmin()) {
            $user->addRole(UserRole::ROLE_ADMIN);
        }

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

        if ($invitation) {
            // If the user has been invited by an admin, we auto confirm the user
            $user->setConfirmationToken(null)->setConfirmedAccountAt(new \DateTime());

            $this->em->remove($invitation);
        } else {
            // We generate a confirmation token to validate email
            $token = $this->tokenGenerator->generateToken();
            $user->setConfirmationToken($token);
            $this->notifier->sendConfirmationEmailMessage($user);
        }

        $this->userManager->updateUser($user);

        return ['user' => $user, 'errorsCode' => null];
    }
}
