<?php

namespace Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\SenderEmailDomain;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;
use Symfony\Component\Process\Process;

class MailjetClient
{
    final public const BASE_URL = 'https://api.mailjet.com/v3/REST/';

    // https://documentation.mailjet.com/hc/fr/articles/360048398994-Statut-des-emails-explication-de-toutes-les-m%C3%A9triques-
    final public const STATUS_SENT = 'sent';
    final public const STATUS_OPENED = 'opened';
    final public const STATUS_CLICKED = 'clicked';
    final public const STATUS_QUEUED = 'queued';

    public Client $client;

    public function __construct(private readonly string $publicKey, private readonly string $privateKey)
    {
        $this->client = new Client();
    }

    public function getSenderEmailDomains(): array
    {
        $data = json_decode($this->get('dns')->getBody())->Data;
        $senderEmailDomains = [];
        foreach ($data as $datum) {
            $senderEmailDomain = self::senderEmailDomainFromData($datum);
            $senderEmailDomains[$senderEmailDomain->getValue()] = $senderEmailDomain;
        }

        return $senderEmailDomains;
    }

    public function createSenderDomain(SenderEmailDomain $domain): SenderEmailDomain
    {
        $mailjetDomain = $this->getSenderEmailDomain($domain->getValue());

        //if domain already exists on mailjet
        if ($mailjetDomain) {
            $domain->setSpfValidation($mailjetDomain->getSpfValidation());
            $domain->setDkimValidation($mailjetDomain->getDkimValidation());
            $domain->setTxtKey($mailjetDomain->getTxtKey());
            $domain->setTxtValue($mailjetDomain->getTxtValue());
            $domain->setTxtValidation(
                self::isTxtValid(
                    $mailjetDomain->getValue(),
                    $mailjetDomain->getTxtKey(),
                    $mailjetDomain->getTxtValue()
                )
            );

            return $domain;
        }

        $this->post('sender', [
            'Email' => self::getEmailRegexFromDomain($domain->getValue()),
        ]);

        return $domain;
    }

    public function getSenderEmailDomain(string $domain): ?SenderEmailDomain
    {
        try {
            return self::senderEmailDomainFromData(
                json_decode($this->get("dns/{$domain}")->getBody())->Data[0]
            );
        } catch (\Exception $exception) {
            if (404 === $exception->getCode()) {
                return null;
            }

            throw $exception;
        }
    }

    public function get(string $endPoint): ResponseInterface
    {
        return $this->client->get(self::BASE_URL . $endPoint, [
            'auth' => $this->getAuth(),
            'headers' => [
                'content-type' => 'application/json',
            ],
        ]);
    }

    public function post(string $endPoint, array $data = []): ResponseInterface
    {
        return $this->client->post(self::BASE_URL . $endPoint, [
            'auth' => $this->getAuth(),
            'headers' => [
                'content-type' => 'application/json',
            ],
            'body' => json_encode($data),
        ]);
    }

    public static function senderEmailDomainFromData(object $data): SenderEmailDomain
    {
        return (new SenderEmailDomain())
            ->setValue($data->Domain)
            ->setService(ExternalServiceConfiguration::MAILER_MAILJET)
            ->setSpfValidation('OK' === $data->SPFStatus)
            ->setDkimValidation('OK' === $data->DKIMStatus)
            ->setTxtKey($data->OwnerShipTokenRecordName)
            ->setTxtValue($data->OwnerShipToken)
            ->setTxtValidation(
                self::isTxtValid(
                    $data->Domain,
                    $data->OwnerShipTokenRecordName,
                    $data->OwnerShipToken
                )
            )
        ;
    }

    private function getAuth(): array
    {
        return [$this->publicKey, $this->privateKey];
    }

    private static function isTxtValid(string $domain, string $key, string $value): bool
    {
        $process = new Process(['dig', '-t', 'txt', $key, '+short']);
        $process->run();

        return $process->isSuccessful() && str_contains($process->getOutput(), $value);
    }

    private static function getEmailRegexFromDomain(string $domain): string
    {
        return '*@' . $domain;
    }
}
