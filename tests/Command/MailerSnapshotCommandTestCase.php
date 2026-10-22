<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\Mailer\Event\MessageEvent;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport\NullTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

abstract class MailerSnapshotCommandTestCase extends DatabaseCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/../../__snapshots__/emails';

    protected function captureEmails(): EmailCaptureListener
    {
        $capture = new EmailCaptureListener();
        $dispatcher = new EventDispatcher();
        $dispatcher->addListener(MessageEvent::class, $capture->onMessage(...));
        $mailer = new Mailer(new NullTransport($dispatcher));

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
        Email $message,
        string $snapshotFilename
    ): void {
        $snapshot = file_get_contents(static::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshotFilename);

        self::assertIsString($snapshot);
        self::assertSame($snapshot, $this->getSnapshotBody($message));
    }

    protected function updateEmailSnapshot(
        Email $message,
        string $snapshotFilename
    ): void {
        $written = file_put_contents(
            static::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshotFilename,
            $this->getSnapshotBody($message)
        );

        self::assertIsInt($written);
    }

    protected function getSnapshotBody(Email $message): string
    {
        $body = preg_replace(
            '#(?<=actionToken\?token=)[^&"\'<\s]+#',
            'SNAPSHOT_TOKEN',
            (string) $message->getHtmlBody()
        );
        $body = preg_replace(
            '#(?<=/profile/followings/)[^/?&"\'<\s]+#',
            'SNAPSHOT_TOKEN',
            (string) $body
        );

        return (string) preg_replace('/[ \\t]+$/m', '', (string) $body);
    }

    protected function assertEmailMetadata(
        Email $message,
        string $recipient,
        string $subject
    ): void {
        self::assertContains($recipient, array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo()));
        self::assertContains('assistance@cap-collectif.com', array_map(static fn (Address $address): string => $address->getAddress(), $message->getFrom()));
        self::assertStringContainsString($subject, $message->getSubject());
    }
}

final class EmailCaptureListener
{
    /** @var list<Email> */
    public array $messages = [];

    public function onMessage(MessageEvent $event): void
    {
        $message = $event->getMessage();
        if (!$message instanceof Email) {
            throw new \RuntimeException('Expected an email message.');
        }

        $this->messages[] = clone $message;
    }

    public function getMessageForRecipient(string $recipient): Email
    {
        foreach ($this->messages as $message) {
            $recipients = array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo());
            if (\in_array($recipient, $recipients, true)) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured for %s.', $recipient));
    }

    public function getMessageWithSubject(string $subject): Email
    {
        foreach ($this->messages as $message) {
            if (str_contains((string) $message->getSubject(), $subject)) {
                return $message;
            }
        }

        throw new \RuntimeException(sprintf('No email was captured with subject %s.', $subject));
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
