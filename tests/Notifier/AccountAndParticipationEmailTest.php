<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Notifier\FOSNotifier;
use Capco\AppBundle\Notifier\MagicLinkNotifier;
use Capco\AppBundle\Notifier\Organization\OrganizationMemberNotifier;
use Capco\AppBundle\Notifier\Participant\ParticipantNotifier;
use Capco\AppBundle\Notifier\ParticipantConsentInternalCommunicationEmailNotifier;
use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Notifier\UserNotifier;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks notification content and recipients through public notifier APIs with real templates and SQL rollback.
 */
class AccountAndParticipationEmailTest extends MailerSnapshotCommandTestCase
{
    /** @dataProvider accountActionEmails */
    public function testAccountActionEmailContainsItsOwnLink(string $method, string $token): void
    {
        $user = $this->entity(User::class, 'user514');
        $emails = $this->captureEmails();

        self::getContainer()->get(FOSNotifier::class)->{$method}($user);

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $user->getEmail(), $token);
    }

    /** @return iterable<string, array{string, string}> */
    public static function accountActionEmails(): iterable
    {
        yield 'registration' => ['sendConfirmationEmailMessage', 'check-my-email-token-with-more-characters-1'];

        yield 'password reset' => ['sendResettingEmailMessage', 'reset-my-password-token'];
    }

    public function testRegistrationWithoutConfirmationTokenDoesNotSendEmail(): void
    {
        $user = $this->entity(User::class, 'user1');
        $emails = $this->captureEmails();

        self::getContainer()->get(FOSNotifier::class)->sendConfirmationEmailMessage($user);

        self::assertCount(0, $emails->messages);
    }

    public function testEmailChangeSendsDifferentMessagesToNewAndOldAddresses(): void
    {
        $user = $this->entity(User::class, 'user515');
        $emails = $this->captureEmails();

        self::getContainer()->get(UserNotifier::class)->newEmailConfirmation($user);

        self::assertCount(2, $emails->messages);
        $this->assertMessage($emails->getMessageForRecipient('new-email-to-confirm@test.com'), 'new-email-to-confirm@test.com', 'check-my-new-email-token');
        $oldAddressMessage = $emails->getMessageForRecipient('user_updating_email@test.com');
        $this->assertMessage($oldAddressMessage, 'user_updating_email@test.com');
        self::assertStringNotContainsString('check-my-new-email-token', (string) $oldAddressMessage->getHtmlBody());
    }

    public function testEmailChangeWithoutNewAddressDoesNotSendEmail(): void
    {
        $user = $this->entity(User::class, 'user1');
        $emails = $this->captureEmails();

        self::getContainer()->get(UserNotifier::class)->newEmailConfirmation($user);

        self::assertCount(0, $emails->messages);
    }

    public function testStepReminderContainsConfirmationLinkAndProjectTitle(): void
    {
        $user = $this->entity(User::class, 'user_not_confirmed');
        $emails = $this->captureEmails();

        self::getContainer()->get(UserNotifier::class)->remindingEmailConfirmationBeforeStepEnd(
            $user->getEmail(),
            $user->getUsername(),
            'https://capco.dev/confirm-step',
            'Projet à confirmer'
        );

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $user->getEmail(), 'https://capco.dev/confirm-step');
        self::assertStringContainsString('Projet à confirmer', (string) $emails->messages[0]->getHtmlBody());
    }

    public function testParticipationReminderContainsAccountConfirmationToken(): void
    {
        $user = $this->entity(User::class, 'user_not_confirmed');
        $emails = $this->captureEmails();

        self::getContainer()->get(UserNotifier::class)->onAccountConfirmationParticipation($user);

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $user->getEmail(), $user->getConfirmationToken());
    }

    /** @dataProvider magicLinkVariants */
    public function testMagicLinkVariantHasExpectedBusinessContent(string $variant, string $expectedText): void
    {
        $user = $this->entity(User::class, 'user5');
        $emails = $this->captureEmails();

        self::getContainer()->get(MagicLinkNotifier::class)->sendEmail($user, 'https://capco.dev/magic?token=known-token', $variant);

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $user->getEmail(), 'https://capco.dev/magic?token=known-token');
        self::assertStringContainsString($expectedText, (string) $emails->messages[0]->getHtmlBody());
    }

    /** @return iterable<string, array{string, string}> */
    public static function magicLinkVariants(): iterable
    {
        yield 'standard' => ['DEFAULT', 'magic-link-email-body'];

        yield 'detected account' => ['ACCOUNT_DETECTED', 'magic-link-account-detected-body-1'];
    }

    /** @dataProvider userInvitationScenarios */
    public function testUserInvitationContainsAcceptanceLink(string $messageId, string $recipient, string $token): void
    {
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(UserInviteEmailMessageNotifier::class);
        $invitationMessage = $this->entity(UserInviteEmailMessage::class, $messageId);

        if ('remEmailMessage' === $messageId) {
            $notifier->onNewInvitation($invitationMessage);
        } else {
            $notifier->onNewInvitationByOrganization($invitationMessage);
        }

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $recipient, '/invitation?token=' . $token);
    }

    /** @return iterable<string, array{string, string, string}> */
    public static function userInvitationScenarios(): iterable
    {
        yield 'platform invitation' => ['remEmailMessage', 'rem@chan.com', 'oniiiichaaan'];

        yield 'organization invitation to register' => ['organizationInvitationMessage', 'toto@cap-collectif.com', 'organizationInvitationToken'];
    }

    public function testExistingOrganizationMemberInvitationContainsAcceptanceLink(): void
    {
        $invitation = $this->entity(PendingOrganizationInvitation::class, 'inviteWelcomatic');
        $emails = $this->captureEmails();

        self::getContainer()->get(OrganizationMemberNotifier::class)->onNewInvitation($invitation);

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], $invitation->getUser()->getEmail(), 'token1');
    }

    public function testParticipantWithoutNewEmailDoesNotReceiveConfirmation(): void
    {
        $participant = $this->entity(Participant::class, 'participant1');
        $participant->setNewEmailToConfirm(null);
        $emails = $this->captureEmails();

        self::getContainer()->get(ParticipantNotifier::class)->sendEmailConfirmation(
            $participant,
            'https://capco.dev/after-confirmation',
            'cookie-value'
        );

        self::assertCount(0, $emails->messages);
    }

    public function testParticipantNewEmailReceivesConfirmationToken(): void
    {
        $participant = $this->entity(Participant::class, 'participant1');
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(ParticipantNotifier::class);

        $participant->setNewEmailToConfirm('participant-new@example.com');
        $participant->setNewEmailConfirmationToken('participant-confirmation-token');
        $notifier->sendEmailConfirmation($participant, 'https://capco.dev/after-confirmation', 'cookie-value');

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], 'participant-new@example.com', 'participant-confirmation-token');
    }

    /** @dataProvider consentScenarios */
    public function testConsentNotificationContainsTheActionLink(bool $consent, string $linkFragment): void
    {
        $emails = $this->captureEmails();
        $notifier = self::getContainer()->get(ParticipantConsentInternalCommunicationEmailNotifier::class);

        if ($consent) {
            $notifier->sendRegisterEmail('participant@example.com', 'https://capco.dev/?participationCookies=cookie-value');
        } else {
            $notifier->sendConfirmConsentInternalCommunicationEmail('participant@example.com', 'https://capco.dev/consent?token=consent-token');
        }

        self::assertCount(1, $emails->messages);
        $this->assertMessage($emails->messages[0], 'participant@example.com', $linkFragment);
    }

    /** @return iterable<string, array{bool, string}> */
    public static function consentScenarios(): iterable
    {
        yield 'confirmation required' => [false, 'consent-token'];

        yield 'already consented' => [true, 'participationCookies'];
    }

    /** @param class-string $class */
    private function entity(string $class, string $id): object
    {
        $entity = $this->entityManager->getRepository($class)->find($id);
        self::assertInstanceOf($class, $entity);

        return $entity;
    }

    private function assertMessage(Email $message, string $recipient, ?string $linkFragment = null): void
    {
        self::assertSame([$recipient], array_map(static fn (Address $address): string => $address->getAddress(), $message->getTo()));
        self::assertNotEmpty($message->getFrom());
        self::assertNotEmpty($message->getSubject());
        self::assertNotEmpty($message->getHtmlBody());
        if (null !== $linkFragment) {
            self::assertStringContainsString($linkFragment, html_entity_decode((string) $message->getHtmlBody()));
        }
    }
}
