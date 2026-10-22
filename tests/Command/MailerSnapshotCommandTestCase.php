<?php

namespace Capco\Tests\Command;

use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

abstract class MailerSnapshotCommandTestCase extends DatabaseCommandTestCase
{
    use \Capco\Tests\Mailer\EmailCaptureTrait;

    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/../../__snapshots__/emails';

    public static function featureFlagOverrides(): array
    {
        return ['multilangue' => true];
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
        self::assertNotEmpty($message->getTo());
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertNotEmpty($message->getHtmlBody());
        $snapshot = file_get_contents(static::EMAIL_SNAPSHOT_DIRECTORY . '/' . $snapshotFilename);

        self::assertIsString($snapshot);
        self::assertSame($this->normalizeSnapshotBody($snapshot), $this->getSnapshotBody($message));
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

        return $this->normalizeSnapshotBody((string) $body);
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

    private function normalizeSnapshotBody(string $body): string
    {
        return (string) preg_replace('/[ \\t]+$/m', '', $body);
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
