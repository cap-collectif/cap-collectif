<?php

namespace Capco\Tests\Mailer;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Mailer\Transport\ConfiguredTransport;
use Capco\AppBundle\Mailer\Transport\LastMailerDeliveryDetails;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;
use Psr\Log\Test\TestLogger;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\TransportFactoryInterface;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\RawMessage;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks selected outbound transports, provider failures and delivery identifiers through the public transport API.
 */
class ConfiguredTransportTest extends TestCase
{
    /** @dataProvider routingProvider */
    public function testRoutesThroughTheConfiguredProvider(
        bool $smtpOnly,
        ?string $provider,
        string $expectedTransport,
        ?string $expectedError
    ): void {
        $repository = $this->createStub(ExternalServiceConfigurationRepository::class);
        $repository->method('findOneBy')
            ->with(['type' => ExternalServiceConfiguration::TYPE_MAILER])
            ->willReturn(null === $provider ? null : (new ExternalServiceConfiguration())->setValue($provider))
        ;
        $smtpTransport = $this->createMock(TransportInterface::class);
        $smtpTransport->expects('smtp' === $expectedTransport ? self::once() : self::never())->method('send');
        $apiTransport = $this->createMock(TransportInterface::class);
        $apiTransport->expects('smtp' === $expectedTransport ? self::never() : self::once())->method('send');
        $factory = $this->createStub(TransportFactoryInterface::class);
        $factory->method('supports')
            ->willReturnCallback(static fn (Dsn $dsn): bool => 'recording' === $dsn->getScheme())
        ;
        $factory->method('create')
            ->willReturnCallback(static function (Dsn $dsn) use ($expectedTransport, $apiTransport): TransportInterface {
                self::assertSame($expectedTransport, $dsn->getHost());

                return $apiTransport;
            })
        ;
        $logger = new TestLogger();

        $this->configuredTransport(
            $smtpOnly,
            $repository,
            $factory,
            $smtpTransport,
            $logger
        )->send($this->email());

        if (null === $expectedError) {
            self::assertFalse($logger->hasErrorRecords());
        } else {
            self::assertTrue($logger->hasError($expectedError));
        }
    }

    /** @return iterable<string, array{bool, null|string, string, null|string}> */
    public static function routingProvider(): iterable
    {
        yield 'Mailjet' => [false, 'mailjet', 'mailjet', null];

        yield 'Mandrill' => [false, 'mandrill', 'mandrill', null];

        yield 'missing configuration falls back to Mandrill' => [false, null, 'mandrill', 'no mailer configuration'];

        yield 'unknown configuration falls back to Mandrill' => [false, 'unknown', 'mandrill', 'unknown mailer value : unknown'];

        yield 'custom SMTP ignores API configuration' => [true, 'mailjet', 'smtp', null];
    }

    public function testProviderChangesAreAppliedBetweenMessages(): void
    {
        $repository = $this->createStub(ExternalServiceConfigurationRepository::class);
        $repository->method('findOneBy')->willReturnOnConsecutiveCalls(
            (new ExternalServiceConfiguration())->setValue('mailjet'),
            (new ExternalServiceConfiguration())->setValue('mandrill')
        );
        $sentThrough = [];
        $factory = $this->createStub(TransportFactoryInterface::class);
        $factory->method('supports')->willReturn(true);
        $factory->method('create')->willReturnCallback(function (Dsn $dsn) use (&$sentThrough): TransportInterface {
            $transport = $this->createMock(TransportInterface::class);
            $transport->method('send')->willReturnCallback(static function () use ($dsn, &$sentThrough): void {
                $sentThrough[] = $dsn->getHost();
            });

            return $transport;
        });
        $transport = $this->configuredTransport(false, $repository, $factory);
        $transport->send($this->email());
        $transport->send($this->email());

        self::assertSame(['mailjet', 'mandrill'], $sentThrough);
    }

    public function testProviderFailureDoesNotSwitchToAnotherProvider(): void
    {
        $repository = $this->createStub(ExternalServiceConfigurationRepository::class);
        $repository->method('findOneBy')->willReturn((new ExternalServiceConfiguration())->setValue('mailjet'));
        $factory = $this->createStub(TransportFactoryInterface::class);
        $factory->method('supports')->willReturn(true);
        $factory->method('create')->willReturnCallback(function (Dsn $dsn): TransportInterface {
            $transport = $this->createMock(TransportInterface::class);
            if ('mailjet' === $dsn->getHost()) {
                $transport->expects(self::once())->method('send')->willThrowException(new TransportException('Provider unavailable'));
            } else {
                $transport->expects(self::never())->method('send');
            }

            return $transport;
        });
        $transport = $this->configuredTransport(false, $repository, $factory);
        $this->expectException(TransportException::class);
        $this->expectExceptionMessage('Provider unavailable');

        $transport->send($this->email());
    }

    public function testRecordsTheSelectedProviderMessageId(): void
    {
        $repository = $this->createStub(ExternalServiceConfigurationRepository::class);
        $repository->method('findOneBy')->willReturn((new ExternalServiceConfiguration())->setValue('mailjet'));
        $factory = $this->createStub(TransportFactoryInterface::class);
        $factory->method('supports')->willReturn(true);
        $factory->method('create')->willReturnCallback(function (): TransportInterface {
            $transport = $this->createMock(TransportInterface::class);
            $transport->method('send')->willReturnCallback(static function (RawMessage $message, ?Envelope $envelope): SentMessage {
                $sentMessage = new SentMessage($message, $envelope ?? Envelope::create($message));
                $sentMessage->setMessageId('provider-message-id');

                return $sentMessage;
            });

            return $transport;
        });
        $deliveryDetails = new LastMailerDeliveryDetails();
        $this->configuredTransport(
            false,
            $repository,
            $factory,
            deliveryDetails: $deliveryDetails
        )->send($this->email());

        self::assertSame('mailjet', $deliveryDetails->getMailerType());
        self::assertSame('provider-message-id', $deliveryDetails->getMessageId());
    }

    private function configuredTransport(
        bool $smtpOnly,
        ExternalServiceConfigurationRepository $repository,
        TransportFactoryInterface $factory,
        ?TransportInterface $smtpTransport = null,
        ?LoggerInterface $logger = null,
        ?LastMailerDeliveryDetails $deliveryDetails = null
    ): ConfiguredTransport {
        return new ConfiguredTransport(
            $smtpTransport ?? $this->createMock(TransportInterface::class),
            new Transport([$factory]),
            $repository,
            $logger ?? new NullLogger(),
            $deliveryDetails ?? new LastMailerDeliveryDetails(),
            $smtpOnly,
            [
                'mandrill' => 'recording://mandrill',
                'mailjet' => 'recording://mailjet',
            ]
        );
    }

    private function email(): Email
    {
        return (new Email())->from('sender@example.com')->to('recipient@example.com')->text('Test');
    }
}
