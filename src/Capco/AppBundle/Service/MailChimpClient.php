<?php

namespace Capco\AppBundle\Service;

use MailchimpTransactional\ApiClient;

class MailChimpClient
{
    public function __construct(
        private readonly string $mandrillApiKey
    ) {
    }

    public function sendSingleMessage(
        string $senderEmail,
        string $email,
        string $subject,
        string $htmlContent,
    ): void {
        $client = (new ApiClient())->setApiKey($this->mandrillApiKey);

        $messageOptions = [
            'from_email' => $senderEmail,
            'to' => [
                [
                    'email' => $email,
                    'type' => 'to',
                ],
            ],
            'subject' => $subject,
            'html' => $htmlContent,
        ];

        $client->messages->send([
            'message' => $messageOptions,
        ]);
    }
}
