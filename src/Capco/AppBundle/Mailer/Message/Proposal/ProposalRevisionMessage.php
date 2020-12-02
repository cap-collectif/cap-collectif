<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\AppBundle\Repository\SiteColorRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Psr\Container\ContainerInterface;

class ProposalRevisionMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'proposal_revision.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyProposalRevision.html.twig';

    public static function getMySubjectVars(ProposalRevision $revision, array $params): array
    {
        return ['proposalName' => $revision->getProposal()->getTitle()];
    }

    public static function getMyTemplateVars(ProposalRevision $revision, array $params): array
    {
        return [
            'proposal' => $revision->getProposal(),
            'currentRevision' => $revision,
            'btnTextColor' => $params['btnTextColor'],
            'btnColor' => $params['btnColor'],
            'revisions' => $params['revisions'],
            'nbRevisions' => \count($params['revisions']),
            'proposalURL' => $params['proposalURL'] . '#edit-proposal',
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
        ];
    }

    public function getFooterTemplate(): string
    {
        return '';
    }

    public static function mockData(ContainerInterface $container)
    {
        $revision = $container->get(ProposalRevisionRepository::class)->find('proposalRevisionInPending2');
        $otherRevisions = $container
            ->get(ProposalRevisionRepository::class)
            ->findByProposal('proposalIdf4');
        $btnColor = $container
            ->get(SiteColorRepository::class)
            ->findOneByKeyname('color.btn.primary.bg')
            ->getValue();
        $btnTextColor = $container
            ->get(SiteColorRepository::class)
            ->findOneByKeyname('color.btn.text')
            ->getValue();
        $proposalURL = $container->get(UrlResolver::class)->getObjectUrl($revision->getProposal());

        return [
            'proposal' => $revision->getProposal(),
            'currentRevision' => $revision,
            'revisions' => $otherRevisions,
            'btnColor' => $btnColor,
            'btnTextColor' => $btnTextColor,
            'nbRevisions' => \count($otherRevisions),
            'proposalURL' => $proposalURL . '#edit-proposal',
            'organizationName' => 'Cap Collectif',
            'siteName' => 'Cap Collectif',
            'baseUrl' => 'http://capco.dev',
            'siteUrl' => 'http://capco.dev',
            'user_locale' => 'fr_FR',
            'template' => self::TEMPLATE,
        ];
    }
}
