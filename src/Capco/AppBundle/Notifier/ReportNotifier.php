<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Reporting\ReportingCreateMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

final class ReportNotifier extends BaseNotifier
{
    protected TranslatorInterface $translator;
    protected UrlResolver $urlResolver;

    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        TranslatorInterface $translator,
        UrlResolver $urlResolver,
        RouterInterface $router,
        LocaleResolver $localeResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
        $this->translator = $translator;
        $this->urlResolver = $urlResolver;
    }

    public function onCreate(Reporting $report)
    {
        $type = $this->translator->trans(
            Reporting::$statusesLabels[$report->getStatus()],
            [],
            'CapcoAppBundle'
        );
        $this->mailer->createAndSendMessage(ReportingCreateMessage::class, $report, [
            'type' => $type,
            'elementURL' => $this->urlResolver->getObjectUrl($report->getRelatedObject(), true),
            'adminURL' => $this->urlResolver->getReportedUrl($report, true),
            'router' => $this->router,
        ]);
    }
}
