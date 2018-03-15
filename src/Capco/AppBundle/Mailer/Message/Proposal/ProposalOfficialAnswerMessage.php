<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\ExternalMessage;

final class ProposalOfficialAnswerMessage extends ExternalMessage
{
    public static function create(
        Proposal $proposal,
        Post $post,
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
        Proposal $proposal,
        Post $post
    ): array {
        return [
            'proposal' => $proposal,
            'post' => $post,
        ];
    }
}
