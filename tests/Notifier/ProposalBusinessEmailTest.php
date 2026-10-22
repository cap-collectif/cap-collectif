<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Notifier\AnalysisNotifier;
use Capco\AppBundle\Notifier\ProposalNewsNotifier;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Notifier\ProposalRevisionNotifier;
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
 * @phpunit-reason Checks proposal notification recipients and business content with real templates and SQL rollback.
 */
class ProposalBusinessEmailTest extends MailerSnapshotCommandTestCase
{
    /**
     * @dataProvider assignmentScenarios
     *
     * @param list<string> $proposalIds
     */
    public function testAnalysisAssignmentAndRevocationReachOnlyAssignedUser(bool $assigned, array $proposalIds): void
    {
        $analyst = self::getContainer()->get(UserRepository::class)->find('userMickael');
        self::assertNotNull($analyst);
        $proposals = array_map(fn (string $id): object => $this->entity(Proposal::class, $id), $proposalIds);
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(AnalysisNotifier::class);

        if ($assigned) {
            $notifier->onAssignation($analyst, $proposals, 'admin.global.evaluers');
        } else {
            $notifier->onRevoke($analyst, $proposals);
        }

        self::assertCount(1, $emails->messages);
        $this->assertBusinessEmail($emails->messages[0], $analyst->getEmail());
        foreach ($proposals as $proposal) {
            self::assertStringContainsString($proposal->getTitle(), (string) $emails->messages[0]->getHtmlBody());
        }
    }

    /** @return iterable<string, array{bool, list<string>}> */
    public static function assignmentScenarios(): iterable
    {
        yield 'single assignment' => [true, ['proposal110']];

        yield 'multiple assignments' => [true, ['proposal110', 'proposal111']];

        yield 'single revocation' => [false, ['proposal110']];

        yield 'multiple revocations' => [false, ['proposal110', 'proposal111']];
    }

    public function testProposalCreationNotifiesAdministrationAndAcknowledgesAuthor(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposal1');
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalNotifier::class)->onCreate($proposal);

        self::assertCount(2, $emails->messages);
        $authorMessage = $emails->getMessageForRecipient($proposal->getAuthor()->getEmail());
        $this->assertBusinessEmail($authorMessage, $proposal->getAuthor()->getEmail());
        self::assertSame('acknowledgement-of-receipt', $authorMessage->getSubject());
        $this->assertBusinessEmail($emails->getMessageForRecipient('dev@cap-collectif.com'), 'dev@cap-collectif.com');
        foreach ($emails->messages as $message) {
            $this->assertBusinessEmail($message);
        }
    }

    public function testProposalWithoutAcknowledgementConfigurationDoesNotEmailItsAuthor(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposal22');
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalNotifier::class)->onCreate($proposal);

        $recipients = [];
        foreach ($emails->messages as $message) {
            foreach ($message->getTo() as $address) {
                $recipients[] = $address->getAddress();
            }
        }
        self::assertCount(1, $emails->messages);
        self::assertNotContains($proposal->getAuthor()->getEmail(), $recipients);
    }

    public function testProposalUpdateAcknowledgesTheAuthor(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposal10');
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalNotifier::class)->onUpdate($proposal, new \DateTime('2017-02-02'));

        self::assertCount(2, $emails->messages);
        $message = $emails->getMessageForRecipient($proposal->getAuthor()->getEmail());
        $this->assertBusinessEmail($message, $proposal->getAuthor()->getEmail());
        $this->assertBusinessEmail($emails->getMessageForRecipient('dev@cap-collectif.com'), 'dev@cap-collectif.com');
        self::assertSame('acknowledgement-of-receipt', $message->getSubject());
        self::assertStringContainsString($proposal->getSlug(), (string) $message->getHtmlBody());
    }

    public function testProposalDeletionNotifiesAdministration(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposal12');
        $proposal->setDeletedAt(new \DateTime('2018-01-01'));
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalNotifier::class)->onDelete($proposal);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessEmail($emails->messages[0], 'dev@cap-collectif.com');
        self::assertStringContainsString('notification.contribution.delete.body', (string) $emails->messages[0]->getHtmlBody());
        foreach ($emails->messages as $message) {
            $this->assertBusinessEmail($message);
        }
    }

    /** @dataProvider proposalChangeScenarios */
    public function testProposalChangesNotifyAssignedReviewers(string $change): void
    {
        $proposal = $this->entity(Proposal::class, 'proposal110');
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(ProposalNotifier::class);

        if ('updated' === $change) {
            $notifier->onUpdate($proposal, new \DateTime('2020-01-02'));
        } else {
            $proposal->setDeletedAt(new \DateTime('2020-01-02'));
            $notifier->onDelete($proposal, $proposal->getSupervisor(), $proposal->getDecisionMaker());
        }

        $reviewers = [$proposal->getSupervisor(), $proposal->getDecisionMaker(), ...$proposal->getAnalysts()->toArray()];
        self::assertCount(3, $reviewers);
        foreach ($reviewers as $reviewer) {
            self::assertNotNull($reviewer);
            $message = $emails->getMessageForRecipient($reviewer->getEmail());
            $this->assertBusinessEmail($message, $reviewer->getEmail());
            self::assertStringContainsString($proposal->getTitle(), (string) $message->getHtmlBody());
        }
    }

    /** @return iterable<string, array{string}> */
    public static function proposalChangeScenarios(): iterable
    {
        yield 'updated' => ['updated'];

        yield 'deleted' => ['deleted'];
    }

    public function testOfficialAnswerIsSentToProposalAuthor(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposalIdf4');
        $post = $this->entity(Post::class, 'post18');
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalNotifier::class)->onOfficialAnswer($proposal, $post);

        self::assertCount(1, $emails->messages);
        $this->assertBusinessEmail($emails->messages[0], $proposal->getAuthor()->getEmail());
        self::assertStringContainsString(json_encode('Très bien tout ça je valide', \JSON_THROW_ON_ERROR), (string) $emails->messages[0]->getHtmlBody());
    }

    /** @dataProvider analysisPublicationScenarios */
    public function testAnalysisPublicationNotifiesAppropriateRoles(string $method, string $proposalId): void
    {
        $proposal = $this->entity(Proposal::class, $proposalId);
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(ProposalNotifier::class);

        if ('onAnalysisPublication' === $method) {
            $analysis = $this->entity(ProposalAnalysis::class, 'proposalAnalysis1');
            $notifier->{$method}($proposal, new \DateTime('2020-01-01'), $analysis);
        } elseif ('onLastAnalysisPublication' === $method) {
            $notifier->{$method}($proposal);
        } else {
            $notifier->{$method}($proposal, new \DateTime('2020-01-01'));
        }

        self::assertNotEmpty($emails->messages);
        $actualRecipients = [];
        foreach ($emails->messages as $message) {
            $this->assertBusinessEmail($message);
            foreach ($message->getTo() as $address) {
                $actualRecipients[] = $address->getAddress();
            }
        }
        if ('onAssessmentPublication' === $method) {
            self::assertContains($proposal->getDecisionMaker()->getEmail(), $actualRecipients);
        } else {
            self::assertContains($proposal->getSupervisor()->getEmail(), $actualRecipients);
        }
        if (\in_array($method, ['onAnalysisPublication', 'onLastAnalysisPublication'], true)) {
            self::assertContains($proposal->getDecisionMaker()->getEmail(), $actualRecipients);
            self::assertCount(2, $emails->messages);
        }
        if ('onDecisionPublication' === $method) {
            foreach ($proposal->getAnalysts() as $analyst) {
                self::assertContains($analyst->getEmail(), $actualRecipients);
            }
        }
    }

    /** @return iterable<string, array{string, string}> */
    public static function analysisPublicationScenarios(): iterable
    {
        yield 'analysis to supervisor and decision maker' => ['onAnalysisPublication', 'proposal109'];

        yield 'last analysis to supervisor and decision maker' => ['onLastAnalysisPublication', 'proposal109'];

        yield 'assessment to decision maker' => ['onAssessmentPublication', 'proposal113'];

        yield 'decision to administrators supervisor and analysts' => ['onDecisionPublication', 'proposal113'];
    }

    public function testCompletedRevisionNotifiesAssignedReviewers(): void
    {
        $proposal = $this->entity(Proposal::class, 'proposalIdf1');
        $revision = $this->entity(ProposalRevision::class, 'proposalRevision2');
        $emails = $this->captureEmails();

        self::getContainer()->get(ProposalRevisionNotifier::class)->onUpdate([$revision], $proposal, '2020-01-02');

        $expectedRecipients = [];
        foreach ([$proposal->getSupervisor(), $proposal->getDecisionMaker(), ...$proposal->getAnalysts()->toArray()] as $reviewer) {
            if ($reviewer) {
                $expectedRecipients[] = $reviewer->getEmail();
            }
        }
        $expectedRecipients = array_values(array_unique($expectedRecipients));
        self::assertNotEmpty($expectedRecipients);
        self::assertCount(\count($expectedRecipients), $emails->messages);
        self::assertEqualsCanonicalizing($expectedRecipients, array_map(
            static fn (Email $message): string => $message->getTo()[0]->getAddress(),
            $emails->messages
        ));
        foreach ($emails->messages as $message) {
            $this->assertBusinessEmail($message);
        }
    }

    /** @dataProvider newsScenarios */
    public function testProposalNewsOnlyNotifiesSubscribedAdministrators(string $method): void
    {
        $post = $this->entity(Post::class, 'post18');
        $subscribers = self::getContainer()->get(UserRepository::class)->findBy(['subscribedToProposalNews' => true]);
        $expectedRecipients = array_map(static fn ($user): string => $user->getEmail(), $subscribers);
        self::assertNotEmpty($expectedRecipients);
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(ProposalNewsNotifier::class);

        if ('onDelete' === $method) {
            $notifier->onDelete(['proposalName' => 'Proposal news', 'projectName' => 'The project', 'postAuthor' => 'Author']);
        } else {
            $notifier->{$method}($post);
        }

        self::assertCount(\count($expectedRecipients), $emails->messages);
        $actualRecipients = [];
        foreach ($emails->messages as $message) {
            $this->assertBusinessEmail($message);
            $actualRecipients[] = $message->getTo()[0]->getAddress();
        }
        self::assertEqualsCanonicalizing($expectedRecipients, $actualRecipients);
    }

    /** @return iterable<string, array{string}> */
    public static function newsScenarios(): iterable
    {
        yield 'created' => ['onCreate'];

        yield 'updated' => ['onUpdate'];

        yield 'deleted' => ['onDelete'];
    }

    /** @param class-string $class */
    private function entity(string $class, string $id): object
    {
        $entity = $this->entityManager->getRepository($class)->find($id);
        self::assertInstanceOf($class, $entity);

        return $entity;
    }

    private function assertBusinessEmail(Email $message, ?string $recipient = null): void
    {
        if (null !== $recipient) {
            self::assertSame([$recipient], array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo()));
        } else {
            self::assertNotEmpty($message->getTo());
        }
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertStringContainsString('http', (string) $message->getHtmlBody());
    }
}
