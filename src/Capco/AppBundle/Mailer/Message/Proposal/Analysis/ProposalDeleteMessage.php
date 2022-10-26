<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Analysis;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class ProposalDeleteMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'contribution.deleted.by.author';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyAnalystOnUpdate.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            'proposalName' => $proposal->getTitle(),
        ];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'siteName' => $params['siteName'],
            'baseUrl' => $params['baseURL'],
            'siteUrl' => $params['baseURL'],
            'projectName' => $proposal->getProject()->getTitle(),
            'proposal' => $proposal,
            'updateDate' => $params['updateDate'],
            'updateTime' => $params['updateTime'],
            'isDeleted' => $params['isDeleted'],
        ];
    }
}
