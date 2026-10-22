<?php

namespace Capco\Tests\MessageHandler;

use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Message\ExportReadyEmailMessage;
use Capco\AppBundle\MessageHandler\ExportReadyEmailMessageHandler;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\Tests\Command\EmailCaptureListener;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\Mailer\Event\MessageEvent;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\NullTransport;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks real Twig output and the download link with SQL rollback and an in-memory mail transport.
 */
class ExportReadyEmailTemplateTest extends MailerSnapshotCommandTestCase
{
    public function testExportEmailActuallyRendersTheDownloadLink(): void
    {
        $capture = new EmailCaptureListener();
        $dispatcher = new EventDispatcher();
        $dispatcher->addListener(MessageEvent::class, $capture->onMessage(...));
        $container = self::getContainer();
        $twig = $container->get(Environment::class);
        self::assertInstanceOf(Environment::class, $twig);
        $translator = $container->get(TranslatorInterface::class);
        self::assertInstanceOf(TranslatorInterface::class, $translator);
        $siteParameterResolver = $container->get(SiteParameterResolver::class);
        self::assertInstanceOf(SiteParameterResolver::class, $siteParameterResolver);
        $senderEmailResolver = $container->get(SenderEmailResolver::class);
        self::assertInstanceOf(SenderEmailResolver::class, $senderEmailResolver);
        $router = $container->get(RouterInterface::class);
        self::assertInstanceOf(RouterInterface::class, $router);
        $handler = new ExportReadyEmailMessageHandler(
            new Mailer(new NullTransport($dispatcher)),
            $twig,
            $translator,
            $siteParameterResolver,
            $senderEmailResolver,
            $router,
            $this->createStub(LoggerInterface::class)
        );

        $handler(new ExportReadyEmailMessage(
            'export-recipient@example.com',
            'https://capco.dev/download/export.csv?token=known-token',
            'Ada',
            'fr-FR',
            'export.csv'
        ));

        self::assertCount(1, $capture->messages);
        $email = $capture->messages[0];
        self::assertSame('export-recipient@example.com', $email->getTo()[0]->getAddress());
        self::assertNotEmpty($email->getFrom());
        self::assertNotEmpty($email->getSubject());
        self::assertStringContainsString('export.csv', (string) $email->getHtmlBody());
        self::assertStringContainsString(
            'href="https://capco.dev/download/export.csv?token=known-token&amp;fromEmail=true"',
            (string) $email->getHtmlBody()
        );
    }
}
