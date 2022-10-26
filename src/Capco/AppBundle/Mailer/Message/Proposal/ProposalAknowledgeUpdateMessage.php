<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProposalAknowledgeUpdateMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'acknowledgement-of-receipt';
    public const TEMPLATE = '@CapcoMail/aknowledgeProposal.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'projectTitle' => self::escape(
                $proposal
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'projectLink' => $params['stepURL'],
            'proposalLink' => $params['proposalURL'],
            'confirmationUrl' => $params['confirmationURL'],
            'proposalPublished' => $proposal->isPublished(),
            'proposalName' => $proposal->getTitle(),
            'proposal' => $proposal,
            'typeOfMail' => 'update',
            'sendAt' => $proposal->getUpdatedAt(),
            'endAt' => $proposal->getStep()->getEndAt(),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'organizationName' => 'Cap Collectif',
            'isTimeless' => $proposal->getStep()->isTimeless(),
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
        ];
    }
}
