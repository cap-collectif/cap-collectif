<?php

namespace Capco\AppBundle\Mailer\Message\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class QuestionnaireAcknowledgeReplyMessage extends ExternalMessage
{
    public static function create(
        Project $project,
        Reply $reply,
        ?\DateTime $endAt,
        string $stepUrl,
        bool $isUpdated,
        AbstractStep $step,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'reply.acknowledgement.subject',
            static::getMySubjectVars(),
            '@CapcoMail/acknowledgeReply.html.twig',
            static::getMyTemplateVars($project, $reply, $endAt, $stepUrl, $step, $isUpdated)
        );
    }

    private static function getMyTemplateVars(
        Project $project,
        Reply $reply,
        ?\DateTime $endAt,
        string $stepUrl,
        AbstractStep $step,
        bool $isUpdated
    ): array {
        return [
            'project' => $project,
            'reply' => $reply,
            'endAt' => $endAt,
            'stepUrl' => $stepUrl,
            'step' => $step,
            'isUpdated' => $isUpdated,
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
