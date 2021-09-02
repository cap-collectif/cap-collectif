<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\User\UserConfirmNewEmailUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserRegistrationConfirmationUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserNewPasswordConfirmationMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Mailer\Message\User\UserAdminConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserConfirmEmailChangedMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewEmailConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserAccountConfirmationReminderMessage;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

final class UserNotifier extends BaseNotifier
{
    private LoggerInterface $logger;
    private UserRegistrationConfirmationUrlResolver $userRegistrationConfirmationUrlResolver;
    private UserConfirmNewEmailUrlResolver $userConfirmNewEmailUrlResolver;

    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        UserRegistrationConfirmationUrlResolver $userRegistrationConfirmationUrlResolver,
        UserConfirmNewEmailUrlResolver $userConfirmNewEmailUrlResolver,
        LoggerInterface $logger,
        LocaleResolver $localeResolver
    ) {
        $this->logger = $logger;
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->userRegistrationConfirmationUrlResolver = $userRegistrationConfirmationUrlResolver;
        $this->userConfirmNewEmailUrlResolver = $userConfirmNewEmailUrlResolver;
    }

    public function adminConfirmation(User $user): void
    {
        if (empty($user->getEmail())) {
            $this->logger->error(__METHOD__ . ' user email can not be empty');

            return;
        }
        if (null === $user->getConfirmationToken()) {
            $this->logger->error(__METHOD__ . ' user must have confirmation token');

            return;
        }
        $this->mailer->createAndSendMessage(
            UserAdminConfirmationMessage::class,
            $user,
            [
                'confirmationURL' => $this->userRegistrationConfirmationUrlResolver->__invoke(
                    $user
                ),
            ],
            $user
        );
    }

    public function newEmailConfirmation(User $user): void
    {
        if (empty($user->getNewEmailToConfirm())) {
            $this->logger->error(__METHOD__ . ' user newemail can not be empty');

            return;
        }
        if (null === $user->getNewEmailConfirmationToken()) {
            $this->logger->error(__METHOD__ . ' user confirmation token must exist');

            return;
        }

        $this->mailer->createAndSendMessage(
            UserNewEmailConfirmationMessage::class,
            $user,
            ['confirmationURL' => $this->userConfirmNewEmailUrlResolver->__invoke($user)],
            $user,
            $user->getNewEmailToConfirm()
        );

        $this->mailer->createAndSendMessage(
            UserConfirmEmailChangedMessage::class,
            $user,
            ['date' => $user->getUpdatedAt()],
            $user
        );
    }

    public function emailConfirmation(User $user): void
    {
        if (null === $user->getConfirmationToken()) {
            $this->logger->error(__METHOD__ . ' user confirmation token must exist');
        }

        $this->mailer->createAndSendMessage(
            UserNewEmailConfirmationMessage::class,
            $user,
            ['confirmationURL' => $this->userConfirmNewEmailUrlResolver->__invoke($user)],
            $user,
            $user->getNewEmailToConfirm()
        );
    }

    public function passwordChangeConfirmation(User $user): void
    {
        $this->mailer->createAndSendMessage(
            UserNewPasswordConfirmationMessage::class,
            $user,
            ['date' => $user->getUpdatedAt()],
            $user
        );
    }

    public function remingAccountConfirmation(User $user): void
    {
        $this->mailer->createAndSendMessage(
            UserAccountConfirmationReminderMessage::class,
            $user,
            ['confirmationURL' => $this->userRegistrationConfirmationUrlResolver->__invoke($user)],
            $user
        );
    }
}
