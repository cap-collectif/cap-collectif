<?php

namespace Capco\AppBundle\MessageHandler;

use Capco\AppBundle\Message\MailSingleRecipientMessage;
use Capco\AppBundle\Service\MailChimpClient;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(fromTransport: 'async', handles: MailSingleRecipientMessage::class)]
class MailSingleRecipientMessageHandler
{
    public function __construct(
        readonly MailChimpClient $mailChimpClient,
    ) {
    }

    public function __invoke(MailSingleRecipientMessage $message): void
    {
        $senderEmail = $message->getSenderEmail();
        $recipientEmail = $message->getRecipientEmail();
        $subject = $message->getSubject();
        $htmlContent = $message->getHtmlContent();

        $this->mailChimpClient->sendSingleMessage(
            senderEmail: $senderEmail,
            email: $recipientEmail,
            subject: $subject,
            htmlContent: $htmlContent,
        );
    }
}
