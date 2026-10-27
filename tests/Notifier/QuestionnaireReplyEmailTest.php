<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks anonymous reply notification recipients and confirmation tokens through the notifier API with SQL rollback.
 */
class QuestionnaireReplyEmailTest extends MailerSnapshotCommandTestCase
{
    /** @dataProvider anonymousReplyScenarios */
    public function testAnonymousReplyNotificationsHaveExpectedRecipients(string $state, int $expectedCount): void
    {
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(QuestionnaireReplyNotifier::class);
        $questionnaire = $this->entityManager->getRepository(Questionnaire::class)->find('questionnaireAnonymous');
        self::assertInstanceOf(Questionnaire::class, $questionnaire);
        $configuration = $questionnaire->getNotificationsConfiguration();
        $configuration->setOnQuestionnaireReplyCreate(true);
        $configuration->setOnQuestionnaireReplyUpdate(true);
        $configuration->setOnQuestionnaireReplyDelete(true);
        if ('delete' === $state) {
            $payload = [
                'state' => 'delete',
                'reply' => [
                    'author_slug' => '',
                    'deleted_at' => '2019-04-24 11:40:34',
                    'project_title' => 'Projet avec questionnaire',
                    'questionnaire_step_title' => 'Questionnaire anonyme',
                    'questionnaire_id' => 'questionnaireAnonymous',
                    'author_name' => 'Anonymous participant',
                    'is_anon_reply' => true,
                ],
            ];
            $notifier->onDelete($payload['reply']);
        } else {
            $participant = $this->entityManager->getRepository(Participant::class)->find('participant1');
            self::assertInstanceOf(Participant::class, $participant);
            $participant->setConfirmationToken('anonymous-questionnaire-confirmation');
            $reply = $this->entityManager->find(Reply::class, 'replyAnonymous1');
            self::assertInstanceOf(Reply::class, $reply);
            $notifier->{'create' === $state ? 'onCreate' : 'onUpdate'}($reply);
        }

        self::assertCount($expectedCount, $emails->messages);
        self::assertSame('dev@cap-collectif.com', $emails->messages[0]->getTo()[0]->getAddress());
        self::assertStringContainsString('email.notification.anon.questionnaire.reply.subject.' . $state, (string) $emails->messages[0]->getSubject());
        foreach ($emails->messages as $message) {
            self::assertNotEmpty($message->getTo());
            self::assertNotEmpty($message->getFrom());
            self::assertNotEmpty($message->getSubject());
            self::assertNotEmpty($message->getHtmlBody());
        }
        if ('create' === $state) {
            $confirmation = $emails->getMessageForRecipient('participant1@cap-collectif.com');
            self::assertStringContainsString('anonymous-questionnaire-confirmation', (string) $confirmation->getHtmlBody());
        }
    }

    /** @return iterable<string, array{string, int}> */
    public static function anonymousReplyScenarios(): iterable
    {
        yield 'anonymous creation and confirmation' => ['create', 2];

        yield 'anonymous update' => ['update', 1];

        yield 'anonymous deletion' => ['delete', 1];
    }

    public function testConfirmedAnonymousParticipantDoesNotReceiveAnotherConfirmation(): void
    {
        $participant = $this->entityManager->getRepository(Participant::class)->find('participant1');
        self::assertInstanceOf(Participant::class, $participant);
        $participant->setConfirmationToken(null);
        $emails = $this->captureEmails();

        $reply = $this->entityManager->find(Reply::class, 'replyAnonymous1');
        self::assertInstanceOf(Reply::class, $reply);
        self::getContainer()->get(QuestionnaireReplyNotifier::class)->onCreate($reply);

        self::assertCount(0, $emails->messages);
    }
}
