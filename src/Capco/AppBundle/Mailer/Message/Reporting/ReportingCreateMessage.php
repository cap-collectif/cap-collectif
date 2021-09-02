<?php

namespace Capco\AppBundle\Mailer\Message\Reporting;

use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Symfony\Component\Routing\RouterInterface;

final class ReportingCreateMessage extends AbstractModeratorMessage
{
    public const SUBJECT = 'reporting.notification.subject';
    public const TEMPLATE = '@CapcoMail/notifyReporting.html.twig';

    public static function getMySubjectVars($moderable, array $params): array
    {
        return [];
    }

    public static function getMyTemplateVars($report, array $params): array
    {
        $contribution = $report->getRelated();
        return [
            'user' => $report->getReporter(),
            'type' => $params['type'],
            'message' => $report->getBodyText(),
            'contribution' => $report->getRelatedObject(),
            'siteUrl' => $params['elementURL'],
            'adminUrl' => $params['adminURL'],
            'moderateSexualLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'reporting.status.sexual',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateOffendingLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'reporting.status.offending',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateInfringementLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'infringement-of-rights',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateSpamLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'reporting.status.spam',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateOffTopicLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'reporting.status.off_topic',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateGuidelineViolationLink' => $params['router']->generate(
                'moderate_contribution',
                [
                    'token' => $contribution->getModerationToken(),
                    'reason' => 'moderation-guideline-violation',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
        ];
    }
}
