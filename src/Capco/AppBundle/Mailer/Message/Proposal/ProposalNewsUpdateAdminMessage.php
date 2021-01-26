<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;

final class ProposalNewsUpdateAdminMessage extends AbstractAdminMessage
{
    public const SUBJECT = 'notification.proposal_activity.update.subject';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyProposalNewsAdmin.html.twig';

    public static function getMyTemplateVars(Post $post, array $params): array
    {
        $proposal = $post->getProposals()->first();

        return [
            'postAuthor' => self::escape(
                $post
                    ->getAuthors()
                    ->first()
                    ->getDisplayName()
            ),
            'proposalName' => self::escape($proposal->getTitle()),
            'postUrl' => $params['postURL'],
            'projectName' => self::escape(
                $proposal
                    ->getProposalForm()
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'bodyTrad' => 'notification.proposal_activity.update.body',
            'titleTrad' => 'notification.proposal_activity.update.subject',
        ];
    }

    public static function getMySubjectVars(Post $post, array $params): array
    {
        $proposal = $post->getProposals()->first();

        return [
            'project' => self::escape(
                $proposal
                    ->getProposalForm()
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
        ];
    }
}
