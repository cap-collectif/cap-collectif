<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;

final class ProposalAknowledgeCreateMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'acknowledgement-of-receipt';
    public const TEMPLATE = '@CapcoMail/aknowledgeProposal.html.twig';

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
            'homepageUrl' => $params['siteURL'],
            'typeOfMail' => 'create',
            'sendAt' => $proposal->getPublishedAt(),
            'endAt' => $proposal->getStep()->getEndAt(),
            'to' => self::escape($proposal->getAuthor()->getEmail()),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
            'isTimeless' => $proposal->getStep()->isTimeless(),
            'baseUrl' => $params['baseURL']
        ];
    }
}
