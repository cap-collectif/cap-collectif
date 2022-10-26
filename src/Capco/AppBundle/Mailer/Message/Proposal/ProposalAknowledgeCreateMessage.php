<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

final class ProposalAknowledgeCreateMessage extends AbstractExternalMessage
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
            'typeOfMail' => 'create',
            'sendAt' => $proposal->getPublishedAt(),
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

    public static function mockData(ContainerInterface $container)
    {
        $proposal = $container->get(ProposalRepository::class)->find('proposal1');

        return [
            'projectTitle' => self::escape(
                $proposal
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'projectLink' => 'projectLink',
            'proposalLink' => 'proposalURL',
            'confirmationUrl' => 'confirmationURL',
            'proposalPublished' => $proposal->isPublished(),
            'proposalName' => $proposal->getTitle(),
            'typeOfMail' => 'create',
            'sendAt' => $proposal->getPublishedAt(),
            'endAt' => $proposal->getStep()->getEndAt(),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'organizationName' => 'Cap Collectif',
            'isTimeless' => $proposal->getStep()->isTimeless(),
            'baseUrl' => 'baseURL',
            'siteName' => 'site name',
            'siteUrl' => 'site URL',
            'user_locale' => 'fr_FR',
        ];
    }
}
