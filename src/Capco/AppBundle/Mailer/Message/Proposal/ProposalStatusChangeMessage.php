<?php

namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Traits\FormatDateTrait;

final class ProposalStatusChangeMessage extends AbstractExternalMessage
{
    public const SUBJECT = 'contribution-notifier-new-status';
    public const TEMPLATE = '@CapcoMail/Proposal/notifyProposalAuthorStatusChange.html.twig';
    public const FOOTER = '';

    public static function getMySubjectVars(Proposal $proposal, array $params): array
    {
        return [
            '{proposalTitle}' => self::escape($proposal->getTitle()),
            '{proposalStatus}' => self::escape($proposal->lastStatus()->getName()),
        ];
    }

    public static function getMyTemplateVars(Proposal $proposal, array $params): array
    {
        $fmt = new \IntlDateFormatter(
            $params['locale'],
            \IntlDateFormatter::FULL,
            \IntlDateFormatter::NONE,
            FormatDateTrait::clearTimeZone($params['timezone']),
            \IntlDateFormatter::GREGORIAN
        );

        return [
            'projectTitle' => $proposal->getProject() ? $proposal->getProject()->getTitle() : '',
            'proposalTitle' => $proposal->getTitle(),
            'proposalStatus' => $proposal->lastStatus()->getName(),
            'proposalUrl' => $params['proposalURL'],
            'baseUrl' => $params['baseURL'],
            'siteName' => $params['siteName'],
            'siteUrl' => $params['siteURL'],
            'titleLayout' => '@CapcoMail/Proposal/titleLayout.html.twig',
            'time' => $params['date']->format('H:i:s'),
            'proposalDate' => $fmt->format($params['date']->getTimestamp()),
            'tableStyle' => 'background-color:rgba(0,0,0, 0.6); border-radius: 4px 4px 0 0;',
            'additionalFooter' => true,
        ];
    }

    public function getFooterVars(): array
    {
        return [
            '%to%' => $this->getRecipient(0)
                ? self::escape($this->getRecipient(0)->getEmailAddress())
                : '',
            '%sitename%' => $this->getSitename(),
            '%siteUrl%' => $this->getSiteUrl(),
        ];
    }

    public function getFooterTemplate(): string
    {
        return self::FOOTER;
    }
}
