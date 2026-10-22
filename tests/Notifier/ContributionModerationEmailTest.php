<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Notifier\ContributionNotifier;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks moderation recipient, reason and contribution link with a real proposal and SQL rollback.
 */
class ContributionModerationEmailTest extends MailerSnapshotCommandTestCase
{
    public function testModeratedContributionEmailContainsReasonAndContributionLink(): void
    {
        $proposal = $this->entityManager->getRepository(Proposal::class)->find('proposal5');
        self::assertInstanceOf(Proposal::class, $proposal);
        $author = $proposal->getAuthor();
        self::assertNotNull($author);
        $emails = $this->captureEmails();

        self::getContainer()->get(ContributionNotifier::class)->onModeration($proposal);

        self::assertCount(1, $emails->messages);
        $message = $emails->messages[0];
        self::assertSame($author->getEmail(), $message->getTo()[0]->getAddress());
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        $body = html_entity_decode((string) $message->getHtmlBody());
        self::assertStringContainsString($author->getUsername(), $body);
        self::assertStringContainsString((string) $proposal->getTrashedReason(), $body);
        self::assertStringContainsString(
            self::getContainer()->get(UrlResolver::class)->getObjectUrl($proposal, true),
            $body
        );
    }
}
