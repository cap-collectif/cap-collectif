<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

abstract class MailerSnapshotCommandTestCase extends DatabaseCommandTestCase
{
    private const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/../../__snapshots__/emails';

    protected function captureEmails(): EmailCaptureListener
    {
        $capture = new EmailCaptureListener();
        $mailer = new \Swift_Mailer(
            new \Swift_Transport_NullTransport(new \Swift_Events_SimpleEventDispatcher())
        );
        $mailer->registerPlugin($capture);

        $container = self::getContainer();
        $twig = $container->get(Environment::class);
        \assert($twig instanceof Environment);
        $translator = $container->get(TranslatorInterface::class);
        \assert($translator instanceof TranslatorInterface);
        $siteParameterResolver = $container->get(SiteParameterResolver::class);
        \assert($siteParameterResolver instanceof SiteParameterResolver);
        $router = $container->get(RouterInterface::class);
        \assert($router instanceof RouterInterface);
        $senderEmailResolver = $container->get(SenderEmailResolver::class);
        \assert($senderEmailResolver instanceof SenderEmailResolver);
        $tokenManager = $container->get(TokenManager::class);
        \assert($tokenManager instanceof TokenManager);
        $container->set(
            MailerService::class,
            new MailerService(
                $mailer,
                $twig,
                $translator,
                $siteParameterResolver,
                $router,
                $senderEmailResolver,
                $tokenManager
            )
        );

        return $capture;
    }

    protected function capturePublishedMessages(): PublishedMessageCapture
    {
        $capture = new PublishedMessageCapture();
        $publisher = $this->createMock(Publisher::class);
        $publisher
            ->method('publish')
            ->willReturnCallback(
                static function (string $messageType, Message $message) use ($capture): void {
                    $capture->messages[] = [
                        'type' => $messageType,
                        'body' => (string) $message->getBody(),
                    ];
                }
            )
        ;
        $container = self::getContainer();
        if (!$container->initialized('swarrot.publisher')) {
            $container->set('swarrot.publisher', $publisher);
        }
        $container->set(Publisher::class, $publisher);
        $capture->publisher = $publisher;

        return $capture;
    }

    protected function assertEmailMatchesSnapshot(
        \Swift_Mime_SimpleMessage $message,
        string $snapshotFilename
    ): void {
        $snapshot = file_get_contents(self::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshotFilename);

        self::assertIsString($snapshot);
        self::assertSame($snapshot, $this->getSnapshotBody($message));
    }

    protected function getSnapshotBody(\Swift_Mime_SimpleMessage $message): string
    {
        $body = preg_replace(
            '#(?<=actionToken\?token=)[^&"\'<\s]+#',
            'SNAPSHOT_TOKEN',
            $message->getBody()
        );

        return (string) preg_replace('/[ \\t]+$/m', '', (string) $body);
    }

    protected function assertEmailMetadata(
        \Swift_Mime_SimpleMessage $message,
        string $recipient,
        string $subject
    ): void {
        self::assertArrayHasKey($recipient, (array) $message->getTo());
        self::assertArrayHasKey('assistance@cap-collectif.com', (array) $message->getFrom());
        self::assertStringContainsString($subject, $message->getSubject());
    }
}

final class EmailCaptureListener implements \Swift_Events_SendListener
{
    /** @var list<\Swift_Mime_SimpleMessage> */
    public array $messages = [];

    public function beforeSendPerformed(\Swift_Events_SendEvent $event): void
    {
        $this->messages[] = clone $event->getMessage();
    }

    public function sendPerformed(\Swift_Events_SendEvent $event): void
    {
    }

    public function getMessageForRecipient(string $recipient): \Swift_Mime_SimpleMessage
    {
        foreach ($this->messages as $message) {
            if (\array_key_exists($recipient, (array) $message->getTo())) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured for %s.', $recipient));
    }
}

final class PublishedMessageCapture
{
    public Publisher $publisher;

    /** @var list<array{type: string, body: string}> */
    public array $messages = [];

    /** @return list<array<string, mixed>> */
    public function payloadsForType(string $type): array
    {
        return array_map(
            static fn (array $message): array => json_decode($message['body'], true, 512, \JSON_THROW_ON_ERROR),
            array_values(array_filter($this->messages, static fn (array $message): bool => $message['type'] === $type))
        );
    }
}
