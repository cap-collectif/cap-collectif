<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\AppBundle\Repository\SiteColorRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Psr\Container\ContainerInterface;

class ProposalRevisionRevisedMessage extends AbstractExternalMessage
{
    final public const SUBJECT = 'proposal_revision_updated.notification.subject';
    final public const TEMPLATE = '@CapcoMail/notifyProposalRevisionRevised.html.twig';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return ['proposalName' => $proposal->getTitle()];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        return [
            'proposal' => $proposal,
            'btnTextColor' => $params['btnTextColor'],
            'btnColor' => $params['btnColor'],
            'revisions' => $params['revisions'],
            'nbRevisions' => \count($params['revisions']),
            'proposalURL' => $params['proposalURL'],
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
        $revision = $container->get(ProposalRevisionRepository::class)->find('proposalRevision2');
        $otherRevisions = $container
            ->get(ProposalRevisionRepository::class)
            ->findByProposal('proposal1')
        ;
        $btnColor = $container
            ->get(SiteColorRepository::class)
            ->findOneByKeyname('color.btn.primary.bg')
            ->getValue()
        ;
        $btnTextColor = $container
            ->get(SiteColorRepository::class)
            ->findOneByKeyname('color.btn.text')
            ->getValue()
        ;
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
