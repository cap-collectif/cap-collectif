<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Mailer\Message\AdminMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProposalMessage extends AdminMessage
{
    public function getFooterTemplate(): string
    {
        return '';
    }

    public static function mockData(ContainerInterface $container, string $template)
    {
        /** @var Proposal $proposal */
        $proposal = $container->get(ProposalRepository::class)->find('proposal1');

        return [
            'proposalUrl' => $container->get(ProposalUrlResolver::class)->__invoke($proposal, true),
            'username' => $proposal->getAuthor()
                ? $proposal->getAuthor()->getDisplayName()
                : 'unknown',
            'siteName' => 'Cap collectif',
            'baseUrl' => 'http://capco.dev',
            'siteUrl' => 'http://capco.dev',
            'proposalTitle' => $proposal->getTitle(),
            'proposalStatus' => $proposal->getStatus() ? $proposal->getStatus() : '',
            'template' => $template,
            'titleLayout' => '@CapcoMail/Proposal/titleLayout.html.twig',
            'time' => $proposal->getUpdatedAt()
                ? $proposal->getUpdatedAt()->format('H:m:i')
                : '00:00:00',
            'proposalDate' => $proposal->getUpdatedAt() ?: null,
            'tableStyle' => 'background-color:rgba(0,0,0, 0.6); border-radius: 4px 4px 0 0;'
        ];
    }

    protected static function getMyTemplateVars(
        Proposal $proposal,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $titleLayout,
        ?string $proposalUrl = null
    ): array {
        return [
            'proposalTitle' => $proposal->getTitle(),
            'proposalStatus' => $proposal->getStatus() ? $proposal->getStatus()->getName() : '',
            'proposalUrl' => $proposalUrl,
            'baseUrl' => $baseUrl,
            'siteName' => $siteName,
            'siteUrl' => $siteUrl,
            'titleLayout' => $titleLayout,
            'time' => $proposal->getUpdatedAt()
                ? $proposal->getUpdatedAt()->format('H:m:i')
                : '00:00:00',
            'proposalDate' => $proposal->getUpdatedAt() ? $proposal->getUpdatedAt() : null,
            'tableStyle' => 'background-color:rgba(0,0,0, 0.6); border-radius: 4px 4px 0 0;'
        ];
    }

    protected static function getMySubjectVars(Proposal $proposal): array
    {
        return [
            '{proposalTitle}' => self::escape($proposal->getTitle())
        ];
    }
}
