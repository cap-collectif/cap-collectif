<?php

namespace Capco\AppBundle\Mailer\Message\Reporting;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Mailer\Message\ModeratorMessage;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Model\ModerableInterface;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Translation\TranslatorInterface;

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
        TranslatorInterface $translator,
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
                $adminUrl,
                $report->getRelatedObject(),
                $router,
                $translator
            ),
            $fromEmail,
            $fromName
        );

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
        string $adminUrl,
        ModerableInterface $moderable,
        RouterInterface $router,
        TranslatorInterface $translator
    ): array {
        return [
            'user' => $user,
            'type' => $type,
            'message' => $message,
            'contribution' => $contribution,
            'siteUrl' => $siteUrl,
            'adminUrl' => $adminUrl,
            'moderateSexualLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.sexual'
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateOffendingLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.offending'
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateInfringementLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'infringement-of-rights'
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateSpamLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.spam'
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateOffTopicLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.off_topic'
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            'moderateGuidelineViolationLink' => $router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'moderation-guideline-violation'
                ],
                RouterInterface::ABSOLUTE_URL
            )
        ];
    }
}
