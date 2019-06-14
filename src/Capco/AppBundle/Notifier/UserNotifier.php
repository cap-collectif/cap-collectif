<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewPasswordConfirmationMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Mailer\Message\User\UserAdminConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserConfirmEmailChangedMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewEmailConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserAccountConfirmationReminderMessage;
use Symfony\Component\Routing\RouterInterface;

final class UserNotifier extends BaseNotifier implements ReplyInterface
{
    private $baseUrl;
    private $router;

    public function __construct(
        RouterInterface $router,
        MailerService $mailer,
        Resolver $siteParams,
        UserResolver $userResolver
    ) {
        $this->router = $router;
        $this->baseUrl = $this->router->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL);
        parent::__construct($mailer, $siteParams, $userResolver);
    }

    public function acknowledgeReply(
        Project $project,
        Reply $reply,
        ?\DateTime $endAt,
        string $stepUrl,
        AbstractStep $step,
        User $user,
        bool $isUpdated = false
    ): void {
        $configUrl = $this->router->generate(
            'admin_capco_app_questionnaire_edit',
            ['id' => $reply->getQuestionnaire()->getId()],
            RouterInterface::ABSOLUTE_URL
        );

        $state = !$isUpdated
            ? QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE
            : QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE;

        $this->mailer->sendMessage(
            QuestionnaireAcknowledgeReplyMessage::create(
                $reply->getAuthor()->getEmail(),
                $reply,
                $project->getTitle(),
                $reply->getUpdatedAt(),
                $this->siteParams->getValue('global.site.fullname'),
                $state,
                $user->isEmailConfirmed()
                    ? ''
                    : $this->userResolver->resolveRegistrationConfirmationUrl($user),
                $configUrl,
                $this->baseUrl,
                $stepUrl,
                $reply->getQuestionnaire()->getTitle()
            )
        );
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
                $user->getNewEmailToConfirm()
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
                $user->getNewEmailToConfirm()
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
