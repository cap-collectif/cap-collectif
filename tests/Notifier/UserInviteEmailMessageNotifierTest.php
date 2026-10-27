<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\DBAL\Enum\MailerType;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Mailer\Transport\LastMailerDeliveryDetails;
use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Response;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Mailer\Bridge\Mailchimp\Transport\MandrillApiTransport;
use Symfony\Component\Mailer\Bridge\Mailjet\Transport\MailjetApiTransport;
use Symfony\Component\Routing\RouterInterface;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks delivery state and outgoing status-check messages through the public API; does not claim SQL persistence.
 */
class UserInviteEmailMessageNotifierTest extends TestCase
{
    /** @dataProvider deliveryProvider */
    public function testTracksProviderDelivery(
        string $mailerType,
        string $providerClass
    ): void {
        $emailMessage = (new UserInviteEmailMessage(new UserInvite()))->setId('123');
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $deliveryDetails = new LastMailerDeliveryDetails();
        $deliveryDetails->record($mailerType, 'provider-message-id');
        $publisher = $this->createMock(Publisher::class);
        $publisher
            ->expects(self::once())
            ->method('publish')
            ->with(
                CapcoAppBundleMessagesTypes::USER_INVITE_CHECK,
                self::callback(static fn (Message $message): bool => [
                    'id' => '123',
                    'provider' => $providerClass,
                ] === json_decode((string) $message->getBody(), true, 512, \JSON_THROW_ON_ERROR))
            )
        ;

        $notifier = $this->createNotifier(
            $entityManager,
            $this->createStub(LoggerInterface::class),
            $this->createMock(MailjetClient::class),
            $this->createMock(MandrillClient::class),
            $deliveryDetails,
            $publisher
        );

        self::assertTrue($notifier->deliver($emailMessage, true));
        self::assertSame($mailerType, $emailMessage->getMailerType());
        self::assertSame('provider-message-id', $emailMessage->getMailerId());
        self::assertSame(UserInviteEmailMessage::WAITING_SENDING, $emailMessage->getInternalStatus());
    }

    /** @return iterable<string, array{string, class-string}> */
    public static function deliveryProvider(): iterable
    {
        yield 'Mailjet' => [MailerType::MAILJET, MailjetApiTransport::class];

        yield 'Mandrill' => [MailerType::MANDRILL, MandrillApiTransport::class];
    }

    public function testMarksSmtpDeliveryAsSentWithoutSchedulingAStatusCheck(): void
    {
        $emailMessage = (new UserInviteEmailMessage(new UserInvite()))->setId('123');
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $publisher = $this->createMock(Publisher::class);
        $publisher->expects(self::never())->method('publish');
        $deliveryDetails = new LastMailerDeliveryDetails();
        $deliveryDetails->record(MailerType::SMTP, 'smtp-message-id');

        $notifier = $this->createNotifier(
            $entityManager,
            $this->createStub(LoggerInterface::class),
            $this->createMock(MailjetClient::class),
            $this->createMock(MandrillClient::class),
            $deliveryDetails,
            $publisher
        );

        self::assertTrue($notifier->deliver($emailMessage, true));
        self::assertSame(MailerType::SMTP, $emailMessage->getMailerType());
        self::assertNull($emailMessage->getMailerId());
        self::assertSame(UserInviteEmailMessage::SENT, $emailMessage->getInternalStatus());
    }

    /**
     * @dataProvider processedStatusProvider
     *
     * @param class-string $providerClass
     */
    public function testProcessesProviderStatus(
        string $providerClass,
        string $providerStatus,
        string $expectedInternalStatus,
        bool $expectedFailure,
        string $mailerId = '456'
    ): void {
        $emailMessage = (new UserInviteEmailMessage(new UserInvite()))
            ->setId('123')
            ->setMailerId($mailerId)
        ;
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $logger = $this->createStub(LoggerInterface::class);
        $mailjetClient = $this->createMock(MailjetClient::class);
        $mandrillClient = $this->createMock(MandrillClient::class);
        $this->configureProviderResponse(
            $providerClass,
            $providerStatus,
            $mailjetClient,
            $mandrillClient,
            $mailerId
        );

        $notifier = $this->createNotifier(
            $entityManager,
            $logger,
            $mailjetClient,
            $mandrillClient
        );

        self::assertSame(
            $expectedFailure,
            $notifier->onStatusCheckInvitation($emailMessage, $providerClass)
        );
        self::assertSame($expectedInternalStatus, $emailMessage->getInternalStatus());
    }

    /** @return iterable<string, array{0: class-string, 1: string, 2: string, 3: bool, 4?: string}> */
    public static function processedStatusProvider(): iterable
    {
        yield 'sent with Mailjet' => [
            MailjetApiTransport::class,
            MailjetClient::STATUS_SENT,
            UserInviteEmailMessage::SENT,
            false,
        ];

        yield 'failed with Mailjet' => [
            MailjetApiTransport::class,
            'bounced',
            UserInviteEmailMessage::SEND_FAILURE,
            true,
        ];

        yield 'opened with Mailjet' => [
            MailjetApiTransport::class,
            MailjetClient::STATUS_OPENED,
            UserInviteEmailMessage::SENT,
            false,
        ];

        yield 'clicked with Mailjet' => [
            MailjetApiTransport::class,
            MailjetClient::STATUS_CLICKED,
            UserInviteEmailMessage::SENT,
            false,
        ];

        yield 'sent with Mandrill' => [
            MandrillApiTransport::class,
            MandrillClient::STATUS_SENT,
            UserInviteEmailMessage::SENT,
            false,
        ];

        yield 'failed with Mandrill' => [
            MandrillApiTransport::class,
            'failed',
            UserInviteEmailMessage::SEND_FAILURE,
            true,
        ];

        yield 'different message with Mandrill' => [
            MandrillApiTransport::class,
            MandrillClient::STATUS_SENT,
            UserInviteEmailMessage::SENT,
            false,
            'another-message',
        ];
    }

    /**
     * @dataProvider queuedProvider
     *
     * @param class-string $providerClass
     */
    public function testQueuedProviderStatusThrows(string $providerClass): void
    {
        $emailMessage = (new UserInviteEmailMessage(new UserInvite()))
            ->setId('123')
            ->setMailerId('456')
        ;
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $logger = $this->createStub(LoggerInterface::class);
        $mailjetClient = $this->createMock(MailjetClient::class);
        $mandrillClient = $this->createMock(MandrillClient::class);
        $this->configureProviderResponse(
            $providerClass,
            MailjetClient::STATUS_QUEUED,
            $mailjetClient,
            $mandrillClient
        );

        $notifier = $this->createNotifier(
            $entityManager,
            $logger,
            $mailjetClient,
            $mandrillClient
        );

        try {
            $notifier->onStatusCheckInvitation($emailMessage, $providerClass);
            self::fail('A queued message must be retried.');
        } catch (UserInviteMessageQueuedException $exception) {
            self::assertSame(UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED, $exception->getMessage());
            self::assertSame(UserInviteEmailMessage::WAITING_SENDING, $emailMessage->getInternalStatus());
        }
    }

    /** @return iterable<string, array{class-string}> */
    public static function queuedProvider(): iterable
    {
        yield 'queued with Mailjet' => [MailjetApiTransport::class];

        yield 'queued with Mandrill' => [MandrillApiTransport::class];
    }

    /** @param class-string $providerClass */
    private function configureProviderResponse(
        string $providerClass,
        string $providerStatus,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient,
        string $mailerId = '456'
    ): void {
        if (MailjetApiTransport::class === $providerClass) {
            $mailjetClient
                ->expects(self::once())
                ->method('get')
                ->with('message/' . $mailerId)
                ->willReturn(new Response(200, [], json_encode([
                    'Data' => [['Status' => $providerStatus]],
                ], \JSON_THROW_ON_ERROR)))
            ;
            $mandrillClient->expects(self::never())->method('post');

            return;
        }

        $mailjetClient->expects(self::never())->method('get');
        $mandrillClient
            ->expects(self::once())
            ->method('post')
            ->with('messages/info', ['id' => $mailerId])
            ->willReturn(new Response(200, [], json_encode([
                'state' => $providerStatus,
            ], \JSON_THROW_ON_ERROR)))
        ;
    }

    private function createNotifier(
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient,
        ?LastMailerDeliveryDetails $deliveryDetails = null,
        ?Publisher $publisher = null
    ): UserInviteEmailMessageNotifier {
        return new UserInviteEmailMessageNotifier(
            $this->createStub(MailerService::class),
            $this->createStub(SiteParameterResolver::class),
            $this->createStub(RouterInterface::class),
            $this->createStub(LocaleResolver::class),
            $entityManager,
            $logger,
            $mailjetClient,
            $mandrillClient,
            $deliveryDetails ?? new LastMailerDeliveryDetails(),
            $publisher ?? $this->createMock(Publisher::class)
        );
    }
}
