<?php

namespace Capco\AppBundle\Mailer\Message\Comment;

use Capco\AppBundle\Entity\ProposalAnalysisComment;
use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Traits\EventMockDataTrait;

final class ProposalAnalysisCommentCreateMessage extends AbstractAdminMessage
{
    use EventMockDataTrait;
    public const SUBJECT = 'notification.comment.analysis.create.subject';
    public const TEMPLATE = '@CapcoMail/Comment/analysisCommentCreate.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(ProposalAnalysisComment $comment, array $params): array
    {
        return [
            'proposalName' => self::escape(
                $comment
                    ->getProposalAnalysis()
                    ->getProposal()
                    ->getTitle()
            ),
        ];
    }

    public static function getMyTemplateVars(ProposalAnalysisComment $comment, array $params): array
    {
        return [
            'organizationName' => $params['organizationName'],
            'username' => $comment->getAuthor()->getUsername(),
            'body' => $comment->getBody(),
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'proposalUrl' => $params['proposalUrl'],
        ];
    }
}
