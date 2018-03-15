<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\GraphQL\Resolver\UserResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Reporting\ReportingCreateMessage;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Translation\TranslatorInterface;

final class ReportNotifier extends BaseNotifier
{
    protected $translator;
    protected $urlResolver;

    public function __construct(MailerService $mailer, Resolver $siteParams, UserResolver $userResolver, TranslatorInterface $translator, UrlResolver $urlResolver)
    {
        parent::__construct($mailer, $siteParams, $userResolver);
        $this->translator = $translator;
        $this->urlResolver = $urlResolver;
    }

    public function onCreate(Reporting $report)
    {
        $type = $this->translator->trans(Reporting::$statusesLabels[$report->getStatus()], [], 'CapcoAppBundle');
        $this->mailer->sendMessage(ReportingCreateMessage::create(
            $report,
            $type,
            $this->urlResolver->getObjectUrl($report->getRelatedObject(), true),
            $this->urlResolver->getReportedUrl($report, true),
            $this->siteParams->getValue('admin.mail.notifications.receive_address'),
            null,
            $report->getReporter()->getEmail(),
            $report->getReporter()->getUsername()
        ));
    }
}
