<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class ProposalCollectEmailPublishedMessage extends AbstractExternalMessage
{
    final public const SUBJECT = 'proposal_collect_email_published.subject';
    final public const TEMPLATE = '@CapcoMail/proposalCollectEmailPublished.html.twig';

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
            'projectTitle' => $proposal->getProject()->getTitle(),
            'proposalUrl' => $params['proposalUrl'],
            'confirmationUrl' => $params['confirmationUrl'],
            'baseUrl' => $params['baseURL'],
            'publishedAt' => $params['publishedAt'],
        ];
    }

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
        ];
    }
}
