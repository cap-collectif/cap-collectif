<?php

namespace Capco\Tests\Command;

/**
 * @internal
 * @coversNothing
 */
class FollowerNotifierCommandTest extends MailerSnapshotCommandTestCase
{
    /**
     * @dataProvider notificationScenarios
     *
     * @param list<array{string, string}> $snapshots
     */
    public function testNotifiesExpectedFollowersWithSnapshots(
        string $time,
        int $expectedEmailCount,
        array $snapshots
    ): void {
        $emails = $this->captureEmails();
        $commandTester = $this->createCommandTester('capco:follower-notifier');

        $commandTester->execute(['--time' => $time]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertCount($expectedEmailCount, $emails->messages);

        foreach ($snapshots as [$recipient, $snapshot]) {
            $message = $emails->getMessageForRecipient($recipient);
            $this->assertEmailMetadata($message, $recipient, 'your-activity-summary-of');
            $this->assertEmailMatchesSnapshot($message, $snapshot);
        }
    }

    /**
     * @return iterable<string, array{string, int, list<array{string, string}>}>
     */
    public function notificationScenarios(): iterable
    {
        yield 'activity summary' => [
            '2017-02-01',
            67,
            [
                ['user@test.com', 'notify_followers<user@test.com>.html'],
                ['admin@test.com', 'notify_followers<admin@test.com>.html'],
            ],
        ];

        yield 'blog post activity' => [
            '2019-01-01',
            66,
            [
                ['user@test.com', 'notify_followers<user@test.com>_blog_post.html'],
                ['admin@test.com', 'notify_followers<admin@test.com>_blog_post.html'],
            ],
        ];

        yield 'IDF BP3 activity' => [
            '2022-01-03',
            2,
            [
                ['user@test.com', 'notify_followers<user@test.com>_idf_bp3.html'],
                [
                    'maxime.auriau@cap-collectif.com',
                    'notify_followers<maxime.auriau@cap-collectif.com>_idf_bp3.html',
                ],
            ],
        ];
    }
}
