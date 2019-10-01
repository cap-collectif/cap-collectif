<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Mailer\Message\AdminMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ProposalMessage extends AdminMessage
{
    public function getFooterTemplate(): string
    {
        return '';
    }

    public static function mockData(ContainerInterface $container, string $template)
    {
        $siteParameter = $container->get(Resolver::class);
        $locale = $siteParameter->getValue('global.locale');
        $timezone = $siteParameter->getValue('global.timezone');
        /** @var Proposal $proposal */
        $proposal = $container->get(ProposalRepository::class)->find('proposal1');
        $now = new \DateTime();
        $fmt = new \IntlDateFormatter(
            $locale,
            \IntlDateFormatter::FULL,
            \IntlDateFormatter::NONE,
            $timezone,
            \IntlDateFormatter::GREGORIAN
        );

        return [
            'proposalUrl' => $container->get(ProposalUrlResolver::class)->__invoke($proposal, true),
            'username' => $proposal->getAuthor()
                ? $proposal->getAuthor()->getDisplayName()
                : 'unknown',
            'siteName' => 'Cap Collectif',
            'baseUrl' => 'http://capco.dev',
            'siteUrl' => 'http://capco.dev',
            'proposalTitle' => $proposal->getTitle(),
            'proposalStatus' => $proposal->lastStatus()->getName(),
            'template' => $template,
            'titleLayout' => '@CapcoMail/Proposal/titleLayout.html.twig',
            'time' => $now->format('H:i:s'),
            'proposalDate' => $fmt->format($now->getTimestamp()),
            'tableStyle' => 'background-color:rgba(0,0,0, 0.6); border-radius: 4px 4px 0 0;'
        ];
    }

    protected static function getMyTemplateVars(
        Proposal $proposal,
        string $baseUrl,
        string $siteName,
        string $siteUrl,
        string $titleLayout,
        Resolver $siteParameter,
        ?string $proposalUrl,
        \DateTime $date
    ): array {
        $locale = $siteParameter->getValue('global.locale');
        $timezone = $siteParameter->getValue('global.timezone');
        $fmt = new \IntlDateFormatter(
            $locale,
            \IntlDateFormatter::FULL,
            \IntlDateFormatter::NONE,
            $timezone,
            \IntlDateFormatter::GREGORIAN
        );

        return [
            'proposalTitle' => $proposal->getTitle(),
            'proposalStatus' => $proposal->lastStatus()->getName(),
            'proposalUrl' => $proposalUrl,
            'baseUrl' => $baseUrl,
            'siteName' => $siteName,
            'siteUrl' => $siteUrl,
            'titleLayout' => $titleLayout,
            'time' => $date->format('H:i:s'),
            'proposalDate' => $fmt->format($date->getTimestamp()),
            'tableStyle' => 'background-color:rgba(0,0,0, 0.6); border-radius: 4px 4px 0 0;',
            'additionalFooter' => true
        ];
    }

    protected static function getMySubjectVars(Proposal $proposal): array
    {
        return [
            '{proposalTitle}' => self::escape($proposal->getTitle())
        ];
    }
}
