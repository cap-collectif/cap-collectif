<?php

namespace Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\SenderEmailDomain;
use GuzzleHttp\Client;
use Psr\Http\Message\ResponseInterface;

class MandrillClient
{
    public const BASE_URL = 'https://mandrillapp.com/api/1.0/';

    // https://mailchimp.com/developer/transactional/api/messages/get-message-info/
    public const STATUS_SENT = 'sent';
    public const STATUS_QUEUED = 'queued';

    public Client $client;

    private string $key;

    public function __construct(string $key)
    {
        $this->key = $key;
        $this->client = new Client();
    }

    public function getSenderEmailDomains(): array
    {
        $data = json_decode($this->post('senders/domains')->getBody());
        $senderEmailDomains = [];
        foreach ($data as $datum) {
            $senderEmailDomain = self::senderEmailDomainFromData($datum);
            $senderEmailDomains[$senderEmailDomain->getValue()] = $senderEmailDomain;
        }

        return $senderEmailDomains;
    }

    public function getSenderEmailDomain(SenderEmailDomain $domain): ?SenderEmailDomain
    {
        $data = json_decode(
            $this->post('senders/check-domain', ['domain' => $domain->getValue()])->getBody()
        );
        $serviceDomain = clone $domain;
        $serviceDomain
            ->setDkimValidation($data->dkim->valid)
            ->setSpfValidation($data->spf->valid)
            ->setTxtKey('mandrill_verify')
            ->setTxtValue($data->verify_txt_key)
            ->setTxtValidation($data->valid_signing);

        return $serviceDomain;
    }

    public function createSenderDomain(SenderEmailDomain $domain): SenderEmailDomain
    {
        //when already existing, mandrill api send back the existing domain
        $mandrillDomain = self::senderEmailDomainFromData(
            json_decode(
                $this->post('senders/add-domain', [
                    'domain' => $domain->getValue(),
                ])->getBody()
            )
        );

        $domain->setSpfValidation($mandrillDomain->getSpfValidation());
        $domain->setDkimValidation($mandrillDomain->getDkimValidation());
        $domain->setTxtKey('mandrill_verify');
        $domain->setTxtValue($mandrillDomain->getTxtValue());
        $domain->setTxtValidation($mandrillDomain->getTxtValidation());

        return $domain;
    }

    public function post(string $endPoint, array $data = []): ResponseInterface
    {
        $data['key'] = $this->getAuth();

        return $this->client->post(self::BASE_URL . $endPoint, [
            'headers' => [
                'content-type' => 'application/json',
            ],
            'body' => json_encode($data),
        ]);
    }

    public static function senderEmailDomainFromData(object $data): SenderEmailDomain
    {
        return (new SenderEmailDomain())
            ->setValue($data->domain)
            ->setService(ExternalServiceConfiguration::MAILER_MANDRILL)
            ->setSpfValidation($data->spf->valid)
            ->setDkimValidation($data->dkim->valid)
            ->setTxtKey('mandrill_verify')
            ->setTxtValue($data->verify_txt_key)
            ->setTxtValidation($data->valid_signing);
    }

    private function getAuth(): string
    {
        return $this->key;
    }
}
