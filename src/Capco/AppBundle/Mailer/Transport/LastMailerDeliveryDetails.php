<?php

namespace Capco\AppBundle\Mailer\Transport;

use Capco\AppBundle\DBAL\Enum\MailerType;

/**
 * Stores the provider and message ID from the most recent synchronous email delivery.
 *
 * This object is registered as a shared Symfony service and injected into both
 * ConfiguredTransport and UserInviteEmailMessageNotifier. The shared state is needed
 * because MailerInterface::send() returns nothing, so the notifier cannot receive the
 * delivery result directly. At the lower transport level, TransportInterface::send()
 * returns a SentMessage containing the ID assigned by Mailjet or Mandrill.
 *
 * After sending an email, ConfiguredTransport records the selected provider and its
 * message ID here. UserInviteEmailMessageNotifier reads them immediately when control
 * returns from MailerService, persists them on UserInviteEmailMessage, and schedules
 * the appropriate provider status check. SMTP deliveries have no provider message ID
 * to track and are therefore marked as sent immediately.
 *
 * This service only describes the last delivery. It does not select a provider or keep
 * a delivery history, so its values must be read immediately after the related send.
 */
final class LastMailerDeliveryDetails
{
    private string $mailerType = MailerType::SMTP;
    private ?string $messageId = null;

    public function record(string $mailerType, ?string $messageId): void
    {
        $this->mailerType = $mailerType;
        $this->messageId = $messageId;
    }

    public function getMailerType(): string
    {
        return $this->mailerType;
    }

    public function getMessageId(): ?string
    {
        return $this->messageId;
    }
}
