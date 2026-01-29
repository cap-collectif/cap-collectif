<?php

namespace Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Toggle\Manager as ToggleManager;
use Mailjet\Client;
use Mailjet\Resources;
use Mailjet\Response as MailjetResponse;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class MailjetClientV2
{
    public const MAX_RECIPIENTS = 50;

    private readonly Client $client;

    public function __construct(
        readonly string $mailjetPublicKey,
        readonly string $mailjetPrivateKey,
        private readonly ToggleManager $toggleManager,
    ) {
        $this->client = new Client(
            key: $mailjetPublicKey,
            secret: $mailjetPrivateKey,
            call: true,
            settings: [
                'version' => 'v3.1',
            ]
        );
    }

    // We ignore missingType.iterableValue because the payload structure depends on the MailJet API
    // @phpstan-ignore missingType.iterableValue
    public function post(array $payload): MailjetResponse
    {
        $payload = [
            'SandboxMode' => $this->toggleManager->isActive(ToggleManager::mailjet_sandbox),
            ...$payload, // paylod in second position so that we can override SandboxMode if needed
        ];

        $response = $this->client->post(
            Resources::$Email,
            [
                'body' => $payload,
            ]
        );

        if (true !== $response->success() && SymfonyResponse::HTTP_TOO_MANY_REQUESTS === $response->getStatus()) {
            sleep(10);
            $response = $this->client->post(
                Resources::$Email,
                [
                    'body' => $payload,
                ]
            );
        }

        return $response;
    }
}
