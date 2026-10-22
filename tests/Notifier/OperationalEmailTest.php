<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Debate\DebateAnonymousArgument;
use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Entity\UserArchive;
use Capco\AppBundle\Notifier\ContactNotifier;
use Capco\AppBundle\Notifier\DebateNotifier;
use Capco\AppBundle\Notifier\Mediator\MediatorNotifier;
use Capco\AppBundle\Notifier\ReportNotifier;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Notifier\UserArchiveNotifier;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks operational notification recipients and content with real templates and SQL rollback.
 */
class OperationalEmailTest extends MailerSnapshotCommandTestCase
{
    public function testContactEmailKeepsSenderIdentityAndMessage(): void
    {
        $emails = $this->captureEmails();

        self::getContainer()->get(ContactNotifier::class)->onContact(
            'contact@example.com',
            'visitor@example.com',
            'Visitor Name',
            'The actual question',
            'Question subject',
            'Contact form'
        );

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], 'contact@example.com', 'The actual question');
        self::assertSame('visitor@example.com', $emails->messages[0]->getReplyTo()[0]->getAddress());
    }

    public function testMediatorParticipationIsSentToParticipant(): void
    {
        $mediator = $this->entity(Mediator::class, 'mediator1');
        $participant = $this->entity(Participant::class, 'participant1');
        $emails = $this->captureEmails();

        self::getContainer()->get(MediatorNotifier::class)->onMediatorAddNewParticipant($mediator, $participant);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], $participant->getEmail(), 'http');
        self::assertStringContainsString('notification.pub.participation.subject', (string) $emails->messages[0]->getSubject());
    }

    public function testNewReportNotifiesAdministrationWithReportLink(): void
    {
        $report = $this->entity(Reporting::class, 2);
        $emails = $this->captureEmails();

        self::getContainer()->get(ReportNotifier::class)->onCreate($report);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], 'dev@cap-collectif.com', 'http');
        self::assertStringContainsString('reporting.notification.subject', (string) $emails->messages[0]->getSubject());
    }

    public function testReadyArchiveIsSentToTheArchiveOwner(): void
    {
        $archive = $this->entity(UserArchive::class, 'userArchive2');
        $emails = $this->captureEmails();

        self::getContainer()->get(UserArchiveNotifier::class)->onUserArchiveGenerated($archive);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], $archive->getUser()->getEmail(), 'http');
        self::assertStringContainsString('email-name-download-copy', (string) $emails->messages[0]->getSubject());
    }

    public function testAnonymousDebateArgumentReceivesItsConfirmationLink(): void
    {
        $argument = $this->entity(DebateAnonymousArgument::class, 'DebateAnonymousArgumentAgainst1');
        $emails = $this->captureEmails();

        self::getContainer()->get(DebateNotifier::class)->sendArgumentConfirmation($argument);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], $argument->getEmail(), $argument->getToken());
    }

    /** @dataProvider smsOrderScenarios */
    public function testSmsOrderNotifiesBusinessTeam(string $method, string $id): void
    {
        $order = $this->entity(SmsOrder::class, $id);
        $emails = $this->captureEmails();

        self::getContainer()->get(SmsNotifier::class)->{$method}($order);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessMessage($emails->messages[0], 'developpement@cap-collectif.com', 'capco.dev');
    }

    /** @return iterable<string, array{string, string}> */
    public static function smsOrderScenarios(): iterable
    {
        yield 'new order' => ['onCreateSmsOrder', 'smsOrder1'];

        yield 'refill order' => ['onRefillSmsOrder', 'smsOrder2'];
    }

    /** @dataProvider smsCreditScenarios */
    public function testSmsCreditNotifiesEveryAdministrator(string $method, string $linkFragment): void
    {
        $credit = $this->entity(SmsCredit::class, 'smsCredit1');
        $admins = self::getContainer()->get(UserRepository::class)->findByRoleAdminOrSuperAdmin();
        $expected = array_map(static fn ($user): string => $user->getEmail(), $admins);
        $emails = $this->captureEmails();

        self::getContainer()->get(SmsNotifier::class)->{$method}($credit);

        self::assertCount(\count($expected), $emails->messages);
        self::assertEqualsCanonicalizing($expected, $this->recipients($emails->messages));
        foreach ($emails->messages as $message) {
            $this->assertBusinessMessage($message, null, $linkFragment);
        }
    }

    /** @return iterable<string, array{string, string}> */
    public static function smsCreditScenarios(): iterable
    {
        yield 'initial credit' => ['onInitialSmsCredit', 'admin-next/projects'];

        yield 'refill credit' => ['onRefillSmsCredit', 'admin-next/secure-participation'];
    }

    public function testConsumedSmsCreditsAlertIncludesAdminsAndBusinessTeam(): void
    {
        $admins = self::getContainer()->get(UserRepository::class)->findByRoleAdminOrSuperAdmin();
        $expected = array_map(static fn ($user): string => $user->getEmail(), $admins);
        $expected[] = 'developpement@cap-collectif.com';
        $emails = $this->captureEmails();

        self::getContainer()->get(SmsNotifier::class)->onAlertSmsConsumedCredit(10, 5);

        self::assertCount(\count($expected), $emails->messages);
        self::assertEqualsCanonicalizing($expected, $this->recipients($emails->messages));
        foreach ($emails->messages as $message) {
            $this->assertBusinessMessage($message, null, 'admin-next/secure-participation');
            self::assertStringContainsString('10', (string) $message->getHtmlBody());
            self::assertStringContainsString('5', (string) $message->getHtmlBody());
        }
    }

    /** @param class-string $class */
    private function entity(string $class, int|string $id): object
    {
        $entity = $this->entityManager->getRepository($class)->find($id);
        self::assertInstanceOf($class, $entity);

        return $entity;
    }

    private function assertBusinessMessage(Email $message, ?string $recipient, string $content): void
    {
        if (null !== $recipient) {
            self::assertSame([$recipient], array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo()));
        } else {
            self::assertNotEmpty($message->getTo());
        }
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertStringContainsString($content, html_entity_decode((string) $message->getHtmlBody()));
    }

    /** @param list<Email> $messages
     * @return list<string>
     */
    private function recipients(array $messages): array
    {
        return array_map(static fn (Email $message): string => $message->getTo()[0]->getAddress(), $messages);
    }
}
