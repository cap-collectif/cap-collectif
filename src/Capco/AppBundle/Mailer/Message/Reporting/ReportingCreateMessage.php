<?php

namespace Capco\AppBundle\Mailer\Message\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;

final class ReportingCreateMessage extends ModeratorMessage
{
    public static function create(
        Reporting $report,
        string $type,
        string $siteUrl,
        string $adminUrl,
        string $recipentEmail,
        string $recipientName = null,
        string $fromEmail,
        RouterInterface $router,
        string $fromName = null
    ): self {
        $message = new self(
            $recipentEmail,
            $recipientName,
            'reporting.notification.subject',
            static::getMySubjectVars(),
            '@CapcoMail/notifyReporting.html.twig',
            static::getMyTemplateVars(
                $report->getReporter(),
                $type,
                $report->getBodyText(),
                $report->getRelatedObject(),
                $siteUrl,
                $adminUrl
            ),
            $fromEmail,
            $fromName
        );

        $message->generateModerationLinks($report->getRelatedObject(), $router);

        return $message;
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }

    private static function getMyTemplateVars(
        User $user,
        string $type,
        string $message,
        Contribution $contribution,
        string $siteUrl,
        string $adminUrl
    ): array {
        return [
            'user' => $user,
            'type' => $type,
            'message' => $message,
            'contribution' => $contribution,
            'siteUrl' => $siteUrl,
            'adminUrl' => $adminUrl
        ];
    }
}
