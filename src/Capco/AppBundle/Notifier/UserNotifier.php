<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Mailer\Message\User\UserAdminConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserConfirmEmailChangedMessage;
use Capco\AppBundle\Mailer\Message\User\UserNewEmailConfirmationMessage;
use Capco\AppBundle\Mailer\Message\User\UserAccountConfirmationReminderMessage;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;

final class UserNotifier extends BaseNotifier
{
    public function acknowledgeReply(
        Project $project,
        Reply $reply,
        ?\DateTime $endAt,
        string $stepUrl,
        bool $isUpdated = false
    ): void {
        $this->mailer->sendMessage(
            QuestionnaireAcknowledgeReplyMessage::create(
                $project,
                $reply,
                $endAt,
                $stepUrl,
                $isUpdated,
                $reply->getAuthor()->getEmail()
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
            UserConfirmEmailChangedMessage::create($user, $user->getEmail())
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
