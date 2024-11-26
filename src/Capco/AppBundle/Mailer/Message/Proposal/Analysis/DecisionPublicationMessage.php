<?php

namespace Capco\AppBundle\Mailer\Message\Proposal\Analysis;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

class DecisionPublicationMessage extends AbstractExternalMessage
{
    final public const SUBJECT = 'notification.contribution.decision.title';
    final public const TEMPLATE = '@CapcoMail/Proposal/decisionPublication.html.twig';
    final public const FOOTER = '';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            'decisionMakerName' => $proposal->getDecisionMaker()->getUsername(),
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
            'proposalUrl' => $params['proposalUrl'],
            'decisionMakerUrl' => $params['decisionMakerUrl'],
            'publicationDate' => $params['publicationDate'],
        ];
    }
}
