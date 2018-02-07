<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\Project\QuestionnaireAcknowledgeReplyMessage;

final class UserNotifier extends BaseNotifier
{
    public function acknowledgeReply(Project $project, Reply $reply)
    {
        $this->mailer->sendMessage(
            QuestionnaireAcknowledgeReplyMessage::create(
                $project,
                $reply,
                $reply->getAuthor()->getEmail()
            )
        );
    }
}
