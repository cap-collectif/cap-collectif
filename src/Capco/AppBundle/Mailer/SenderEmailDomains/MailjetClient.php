<?php

namespace Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\SenderEmailDomain;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

class MailjetClient
{
    public const BASE_URL = 'https://api.mailjet.com/v3/REST/';

    // https://documentation.mailjet.com/hc/fr/articles/360048398994-Statut-des-emails-explication-de-toutes-les-m%C3%A9triques-
    public const STATUS_SENT = 'sent';
    public const STATUS_OPENED = 'opened';
    public const STATUS_CLICKED = 'clicked';
    public const STATUS_QUEUED = 'queued';

    public Client $client;

    private string $publicKey;
    private string $privateKey;

    public function __construct(string $publicKey, string $privateKey)
    {
        $this->publicKey = $publicKey;
        $this->privateKey = $privateKey;
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
                json_decode($this->get("dns/${domain}")->getBody())->Data[0]
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
            ->setDkimValidation('OK' === $data->DKIMStatus);
    }

    private function getAuth(): array
    {
        return [$this->publicKey, $this->privateKey];
    }

    private static function getEmailRegexFromDomain(string $domain): string
    {
        return '*@' . $domain;
    }
}
