<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProposalOfficialAnswerMessage extends ExternalMessage
{
    public static function create(
        Proposal $proposal,
        $post,
        string $recipentEmail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'proposal_answer.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyProposalAnswer.html.twig',
            static::getMyTemplateVars(
                $proposal,
                $post
            )
        );
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        $proposal,
        $post
    ): array {
        return [
            'proposal' => $proposal,
            'post' => $post,
        ];
    }
}
