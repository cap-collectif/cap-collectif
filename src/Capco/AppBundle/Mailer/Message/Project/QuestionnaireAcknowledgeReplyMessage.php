<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class QuestionnaireAcknowledgeReplyMessage extends ExternalMessage
{
    public static function create(
        Project $project,
        Reply $reply,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'reply.acknowledgement.subject',
            static::getMySubjectVars(),
            '@CapcoMail/acknowledgeReply.html.twig',
            static::getMyTemplateVars(
                $project,
                $reply
            )
        );
    }

    private static function getMyTemplateVars(
        Project $project,
        Reply $reply
    ): array {
        return [
            'project' => $project,
            'reply' => $reply,
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
