<?php

namespace Capco\AppBundle\MessageHandler;

use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Message\ExportReadyEmailMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use GuzzleHttp\Psr7\Query;
use GuzzleHttp\Psr7\Uri;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

#[AsMessageHandler(fromTransport: 'async', handles: ExportReadyEmailMessage::class)]
class ExportReadyEmailMessageHandler
{
    public function __construct(
        private readonly \Swift_Mailer $mailer,
        private readonly Environment $twig,
        private readonly TranslatorInterface $translator,
        private readonly SiteParameterResolver $siteParameterResolver,
        private readonly SenderEmailResolver $senderEmailResolver,
        private readonly RouterInterface $router,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(ExportReadyEmailMessage $message): void
    {
        $locale = $message->getUserLocale() ?: $this->translator->getLocale();
        $siteName = $this->siteParameterResolver->getValue('global.site.fullname');
        $baseUrl = $this->router->generate('app_homepage', ['_locale' => $locale], RouterInterface::ABSOLUTE_URL);
        $downloadUrl = $this->addEmailSourceToDownloadUrl($message->getDownloadUrl());

        $subject = $this->translator->trans('export.email.subject', [
            'platformName' => $siteName,
        ], 'CapcoAppBundle', $locale);

        $htmlContent = $this->twig->render('@CapcoMail/exportReadyEmail.html.twig', [
            'downloadUrl' => $downloadUrl,
            'fileName' => $message->getFileName(),
            'siteName' => $siteName,
            'baseUrl' => $baseUrl,
            'user_locale' => $locale,
            'username' => $message->getUsername(),
        ]);

        $senderEmail = ($this->senderEmailResolver)();
        $swiftMessage = new \Swift_Message();
        $swiftMessage
            ->setSubject($subject)
            ->setFrom([$senderEmail => $siteName])
            ->setTo([$message->getUserEmail() => $message->getUserEmail()])
            ->setBody($htmlContent, 'text/html')
        ;

        $failedRecipients = [];
        $this->mailer->send($swiftMessage, $failedRecipients);

        if (!empty($failedRecipients)) {
            $this->logger->warning('Export ready email failed for recipients', [
                'recipients' => $failedRecipients,
            ]);
        }
    }

    private function addEmailSourceToDownloadUrl(string $downloadUrl): string
    {
        $uri = new Uri($downloadUrl);
        $query = Query::parse($uri->getQuery());
        $query['fromEmail'] = 'true';

        return (string) $uri->withQuery(Query::build($query));
    }
}
