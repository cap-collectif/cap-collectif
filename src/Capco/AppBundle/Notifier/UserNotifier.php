<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\User\UserConfirmNewEmailUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserRegistrationConfirmationUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserNewPasswordConfirmationMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Mailer\Message\User\UserAdminConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserConfirmEmailChangedMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewEmailConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserAccountConfirmationReminderMessage;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\RouterInterface;

final class UserNotifier extends BaseNotifier
{
    private $questionnaireReplyNotifier;
    private $logger;
    private $userRegistrationConfirmationUrlResolver;
    private $userConfirmNewEmailUrlResolver;

    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        Resolver $siteParams,
        UserRegistrationConfirmationUrlResolver $userRegistrationConfirmationUrlResolver,
        UserConfirmNewEmailUrlResolver $userConfirmNewEmailUrlResolver,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier,
        LoggerInterface $logger
    ) {
        $this->questionnaireReplyNotifier = $questionnaireReplyNotifier;
        $this->logger = $logger;
        parent::__construct($mailer, $siteParams, $router);
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
        $this->mailer->sendMessage(
            UserAdminConfirmationMessage::create(
                $user,
                $this->siteParams->getValue('global.site.fullname'),
                $this->userRegistrationConfirmationUrlResolver->__invoke($user),
                $user->getEmail()
            )
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

        $this->mailer->sendMessage(
            UserNewEmailConfirmationMessage::create(
                $user,
                $this->userConfirmNewEmailUrlResolver->__invoke($user),
                $user->getNewEmailToConfirm(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->baseUrl
            )
        );

        $this->mailer->sendMessage(
            UserConfirmEmailChangedMessage::create(
                $user,
                $user->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->baseUrl,
                $user->getEmail()
            )
        );
    }

    public function emailConfirmation(User $user): void
    {
        if (null === $user->getConfirmationToken()) {
            $this->logger->error(__METHOD__ . ' user confirmation token must exist');
        }
        $this->mailer->sendMessage(
            UserNewEmailConfirmationMessage::create(
                $user,
                $this->userRegistrationConfirmationUrlResolver->__invoke($user),
                $user->getNewEmailToConfirm(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->baseUrl
            )
        );
    }

    public function passwordChangeConfirmation(User $user): void
    {
        $this->mailer->sendMessage(
            UserNewPasswordConfirmationMessage::create(
                $user,
                $user->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $this->baseUrl,
                $user->getEmail()
            )
        );
    }

    public function remingAccountConfirmation(User $user): void
    {
        $this->mailer->sendMessage(
            UserAccountConfirmationReminderMessage::create(
                $user,
                $this->userRegistrationConfirmationUrlResolver->__invoke($user),
                $this->siteParams->getValue('global.site.fullname')
            )
        );
    }
}
