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
            'proposalShowUrl' => $params['proposalShowUrl'],
            'proposalEditUrl' => $params['proposalEditURL'],
            'confirmationUrl' => $params['confirmationURL'],
            'proposalPublished' => $proposal->isPublished(),
            'proposalName' => $proposal->getTitle(),
            'proposalTitle' => $proposal->getTitle(),
            'proposalPublishedDate' => $params['proposalPublishedDate'],
            'proposalPublishedDateTime' => $params['proposalPublishedDateTime'],
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
            'platformName' => $params['platformName'],
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
            'proposalShowUrl' => 'proposalShowUrl',
            'proposalEditUrl' => 'proposalEditUrl',
            'confirmationUrl' => 'confirmationURL',
            'proposalPublished' => $proposal->isPublished(),
            'proposalName' => $proposal->getTitle(),
            'proposalTitle' => $proposal->getTitle(),
            'proposalPublishedDate' => 'proposalPublishedDate',
            'proposalPublishedDateTime' => 'proposalPublishedDateTime',
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
            'platformName' => 'platform name',
            'user_locale' => 'fr_FR',
        ];
    }
}
