<?php

namespace Capco\Tests\MessageHandler;

use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Message\ExportReadyEmailMessage;
use Capco\AppBundle\MessageHandler\ExportReadyEmailMessageHandler;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

/**
 * @internal
 * @coversNothing
 */
class ExportReadyEmailMessageHandlerTest extends TestCase
{
    public function testSendsExpectedExportEmail(): void
    {
        $mailer = $this->createMock(MailerInterface::class);
        $mailer
            ->expects(self::once())
            ->method('send')
            ->willReturnCallback(static function (Email $email): void {
                self::assertSame('Export ready', $email->getSubject());
                self::assertSame(
                    ['sender@example.com'],
                    array_map(static fn (Address $address): string => $address->getAddress(), $email->getFrom())
                );
                self::assertSame('Cap Collectif', $email->getFrom()[0]->getName());
                self::assertSame(
                    ['recipient@example.com'],
                    array_map(static fn (Address $address): string => $address->getAddress(), $email->getTo())
                );
                self::assertSame('recipient@example.com', $email->getTo()[0]->getName());
                self::assertSame('<p>Export ready</p>', $email->getHtmlBody());
            })
        ;
        $twig = $this->createMock(Environment::class);
        $twig
            ->expects(self::once())
            ->method('render')
            ->with('@CapcoMail/exportReadyEmail.html.twig', [
                'downloadUrl' => 'https://example.com/export.csv?token=abc&fromEmail=true',
                'fileName' => 'export.csv',
                'siteName' => 'Cap Collectif',
                'baseUrl' => 'https://example.com/',
                'user_locale' => 'en-GB',
                'username' => 'Ada',
            ])
            ->willReturn('<p>Export ready</p>')
        ;
        $translator = $this->createMock(TranslatorInterface::class);
        $translator
            ->expects(self::once())
            ->method('trans')
            ->with(
                'export.email.subject',
                ['platformName' => 'Cap Collectif'],
                'CapcoAppBundle',
                'en-GB'
            )
            ->willReturn('Export ready')
        ;
        $siteParameterResolver = $this->createMock(SiteParameterResolver::class);
        $siteParameterResolver
            ->expects(self::once())
            ->method('getValue')
            ->with('global.site.fullname')
            ->willReturn('Cap Collectif')
        ;
        $senderEmailResolver = $this->createMock(SenderEmailResolver::class);
        $senderEmailResolver->method('__invoke')->willReturn('sender@example.com');
        $router = $this->createMock(RouterInterface::class);
        $router
            ->expects(self::once())
            ->method('generate')
            ->with('app_homepage', ['_locale' => 'en-GB'], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://example.com/')
        ;
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects(self::never())->method('warning');
        $handler = new ExportReadyEmailMessageHandler(
            $mailer,
            $twig,
            $translator,
            $siteParameterResolver,
            $senderEmailResolver,
            $router,
            $logger
        );

        $handler(new ExportReadyEmailMessage(
            'recipient@example.com',
            'https://example.com/export.csv?token=abc',
            'Ada',
            'en-GB',
            'export.csv'
        ));
    }

    public function testRethrowsTransportFailureAfterLoggingIt(): void
    {
        $exception = new TransportException('Provider unavailable');
        $mailer = $this->createMock(MailerInterface::class);
        $mailer->expects(self::once())->method('send')->willThrowException($exception);
        $twig = $this->createMock(Environment::class);
        $twig->method('render')->willReturn('<p>Export ready</p>');
        $translator = $this->createMock(TranslatorInterface::class);
        $translator->method('trans')->willReturn('Export ready');
        $siteParameterResolver = $this->createMock(SiteParameterResolver::class);
        $siteParameterResolver->method('getValue')->willReturn('Cap Collectif');
        $senderEmailResolver = $this->createMock(SenderEmailResolver::class);
        $senderEmailResolver->method('__invoke')->willReturn('sender@example.com');
        $router = $this->createMock(RouterInterface::class);
        $router->method('generate')->willReturn('https://example.com/');
        $logger = $this->createMock(LoggerInterface::class);
        $logger
            ->expects(self::once())
            ->method('warning')
            ->with('Export ready email failed for recipients', [
                'recipients' => ['recipient@example.com'],
                'exception' => $exception,
            ])
        ;
        $handler = new ExportReadyEmailMessageHandler(
            $mailer,
            $twig,
            $translator,
            $siteParameterResolver,
            $senderEmailResolver,
            $router,
            $logger
        );
        $message = new ExportReadyEmailMessage(
            'recipient@example.com',
            'https://example.com/export.csv',
            'Ada',
            'en-GB',
            'export.csv'
        );
        $this->expectExceptionObject($exception);

        $handler($message);
    }
}
