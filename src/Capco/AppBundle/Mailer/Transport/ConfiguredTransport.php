<?php

namespace Capco\AppBundle\Mailer\Transport;

use Capco\AppBundle\DBAL\Enum\MailerType;
use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Symfony\Component\Mime\RawMessage;

final class ConfiguredTransport implements TransportInterface
{
    /** @var array<string, TransportInterface> */
    private array $apiTransports = [];

    /** @param array<string, string> $apiDsns */
    public function __construct(
        private readonly TransportInterface $smtpTransport,
        private readonly Transport $transportFactory,
        private readonly ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        private readonly LoggerInterface $logger,
        private readonly LastMailerDeliveryDetails $deliveryDetails,
        private readonly bool $productionSmtpMailer,
        private readonly array $apiDsns
    ) {}

    public function __toString(): string
    {
        return 'configured-mailer';
    }

    public function send(RawMessage $message, ?Envelope $envelope = null): ?SentMessage
    {
        if ($this->productionSmtpMailer) {
            $sentMessage = $this->smtpTransport->send($message, $envelope);
            $this->deliveryDetails->record(MailerType::SMTP, null);

            return $sentMessage;
        }

        $configuration = $this->externalServiceConfigurationRepository->findOneBy([
            'type' => ExternalServiceConfiguration::TYPE_MAILER,
        ]);
        $provider = $configuration ? $configuration->getValue() : null;
        if (!isset($this->apiDsns[$provider])) {
            $this->logger->error($configuration ? 'unknown mailer value : ' . $provider : 'no mailer configuration');
            $provider = ExternalServiceConfiguration::MAILER_MANDRILL;
        }

        $transport = $this->apiTransports[$provider] ??= $this->transportFactory->fromString($this->apiDsns[$provider]);

        $sentMessage = $transport->send($message, $envelope);
        $this->deliveryDetails->record($provider, $sentMessage ? $sentMessage->getMessageId() : null);

        return $sentMessage;
    }
}
