<?php

namespace Capco\AppBundle\Mailer\Transport;

use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

class MailjetTransport implements \Swift_Transport
{
    protected const API_URL = 'https://api.mailjet.com/v3.1/send';
    private ?string $publicKey = null;
    private ?string $privateKey = null;
    private ?string $lastSentMessageId = null;

    public function __construct(
        protected \Swift_Events_EventDispatcher $dispatcher
    ) {
    }

    /**
     * Not used.
     */
    public function isStarted()
    {
        return false;
    }

    /**
     * Not used.
     */
    public function start()
    {
    }

    /**
     * Not used.
     */
    public function stop()
    {
    }

    /**
     * Not used.
     */
    public function ping(): bool
    {
        return true;
    }

    public function send(
        \Swift_Mime_SimpleMessage $message,
        &$failedRecipients = null,
        ?\Swift_Events_Event $event = null
    ): int {
        $this->lastSentMessageId = null;
        $response = (new Client())->post(self::API_URL, $this->createPostOptions($message));

        if (200 <= $response->getStatusCode() && $response->getStatusCode() <= 300) {
            return $this->handleSuccess($response, $event);
        }

        $failedRecipients[] = self::createMailjetMessageFrom($message)['Email'];

        return 0;
    }

    public function getPublicKey(): ?string
    {
        return $this->publicKey;
    }

    public function setPublicKey(?string $publicKey): self
    {
        $this->publicKey = $publicKey;

        return $this;
    }

    public function getPrivateKey(): ?string
    {
        return $this->privateKey;
    }

    public function setPrivateKey(?string $privateKey): self
    {
        $this->privateKey = $privateKey;

        return $this;
    }

    public function registerPlugin(\Swift_Events_EventListener $plugin)
    {
        $this->dispatcher->bindEventListener($plugin);
    }

    public function getLastMessageId(): ?string
    {
        return $this->lastSentMessageId;
    }

    private function handleSuccess(
        ResponseInterface $response,
        ?\Swift_Events_Event $event = null
    ): int {
        $responseBody = json_decode($response->getBody()->getContents(), true);
        $this->lastSentMessageId = $responseBody['Messages'][0]['To'][0]['MessageID'];
        $count = $responseBody['Count'] ?? 0;
        if ($event) {
            $this->handleSuccessEvent($count, $event);
        }

        return $count;
    }

    private function handleSuccessEvent(int $count, \Swift_Events_Event $event): void
    {
        if ($count > 0) {
            $event->setResult(\Swift_Events_SendEvent::RESULT_SUCCESS);
        } else {
            $event->setResult(\Swift_Events_SendEvent::RESULT_FAILED);
        }

        $this->dispatcher->dispatchEvent($event, 'sendPerformed');
    }

    private function createPostOptions(\Swift_Mime_SimpleMessage $message): array
    {
        return [
            'query' => [],
            'json' => ['Messages' => [self::createMailjetMessage($message)]],
            'auth' => [$this->getPublicKey(), $this->getPrivateKey()],
            'headers' => [
                'content-type' => 'application/json',
            ],
        ];
    }

    private static function createMailjetMessage(\Swift_Mime_SimpleMessage $message): array
    {
        return [
            'From' => self::createMailjetMessageFrom($message),
            'To' => self::createMailjetMessageTo($message),
            'Cc' => self::createMailjetMessageCc($message),
            'Bcc' => self::createMailjetMessageBcc($message),
            'Subject' => $message->getSubject(),
            'HTMLPart' => $message->getBody(),
        ];
    }

    private static function createMailjetMessageFrom(\Swift_Mime_SimpleMessage $message): array
    {
        $fromAddresses = $message->getFrom();
        $fromEmails = array_keys($fromAddresses);
        $fromEmail = $fromEmails[0];
        $fromName = $fromAddresses[$fromEmail];

        return [
            'Email' => $fromEmail,
            'Name' => $fromName,
        ];
    }

    private static function createMailjetMessageTo(\Swift_Mime_SimpleMessage $message): array
    {
        $to = [];
        foreach ($message->getTo() as $email => $name) {
            $to[] = [
                'Email' => $email,
                'Name' => $name,
            ];
        }

        return $to;
    }

    private static function createMailjetMessageCc(\Swift_Mime_SimpleMessage $message): array
    {
        $cc = [];
        foreach ($message->getCc() ?? [] as $email => $name) {
            $cc[] = [
                'Email' => $email,
                'Name' => $name,
            ];
        }

        return $cc;
    }

    private static function createMailjetMessageBcc(\Swift_Mime_SimpleMessage $message): array
    {
        $bcc = [];
        foreach ($message->getBcc() ?? [] as $email => $name) {
            $bcc[] = [
                'Email' => $email,
                'Name' => $name,
            ];
        }

        return $bcc;
    }
}
