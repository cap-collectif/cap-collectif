<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\User\UserNewPasswordConfirmationMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Mailer\Message\User\UserAdminConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserConfirmEmailChangedMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewEmailConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserAccountConfirmationReminderMessage;
use Symfony\Component\Routing\RouterInterface;

final class UserNotifier extends BaseNotifier
{
    private $baseUrl;
    private $router;
    private $questionnaireReplyNotifier;

    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $this->router = $router;
        $this->questionnaireReplyNotifier = $questionnaireReplyNotifier;
        $this->baseUrl = $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function adminConfirmation(User $user): void
    {
        $this->mailer->sendMessage(
            UserAdminConfirmationMessage::create(
                $user,
                $this->siteParams->getValue('global.site.fullname'),
                $this->userResolver->resolveRegistrationConfirmationUrl($user),
                $user->getEmail()
            )
        );
    }

    public function newEmailConfirmation(User $user): void
    {
        $this->mailer->sendMessage(
            UserNewEmailConfirmationMessage::create(
                $user,
                $this->userResolver->resolveConfirmNewEmailUrl($user),
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
        $this->mailer->sendMessage(
            UserNewEmailConfirmationMessage::create(
                $user,
                $this->userResolver->resolveRegistrationConfirmationUrl($user),
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
                $this->userResolver->resolveRegistrationConfirmationUrl($user),
                $this->siteParams->getValue('global.site.fullname')
            )
        );
    }
}
