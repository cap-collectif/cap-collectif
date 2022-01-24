<?php

namespace spec\Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\SenderEmailDomain;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use PhpSpec\ObjectBehavior;

class MailjetClientSpec extends ObjectBehavior
{
    public function let()
    {
        $this->beConstructedWith('publicKey', 'privateKey');
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(MailjetClient::class);
    }

    public function it_convert_data_to_domain()
    {
        $data = new \stdClass();
        $data->Domain = 'cap-collectif.com';
        $data->SPFStatus = 'OK';
        $data->DKIMStatus = 'KO';
        $data->OwnerShipToken = 'mailjetTokenValue';
        $data->OwnerShipTokenRecordName = 'mailjetToken';

        $senderEmailDomain = $this->senderEmailDomainFromData($data);

        $senderEmailDomain->getValue()->shouldBe('cap-collectif.com');
        $senderEmailDomain->getService()->shouldBe('mailjet');
        $senderEmailDomain->getDkimValidation()->shouldBe(false);
        $senderEmailDomain->getSpfValidation()->shouldBe(true);
        $senderEmailDomain->getTxtKey()->shouldBe('mailjetToken');
        $senderEmailDomain->getTxtValue()->shouldBe('mailjetTokenValue');
        $senderEmailDomain->getTxtValidation()->shouldBe(false);
    }

    public function it_get_existing_domain(Client $client, Response $response)
    {
        $domainData = new \stdClass();
        $domainData->Domain = 'cap-collectif.com';
        $domainData->SPFStatus = 'OK';
        $domainData->DKIMStatus = 'KO';
        $domainData->OwnerShipToken = 'mailjetTokenValue';
        $domainData->OwnerShipTokenRecordName = 'mailjetToken';
        $body = new \stdClass();
        $body->Data = [$domainData];
        $response->getBody()->willReturn(json_encode($body));
        $this->client = $client;
        $client
            ->get('https://api.mailjet.com/v3/REST/dns/cap-collectif.com', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
            ])
            ->willReturn($response);

        $senderEmailDomain = $this->getSenderEmailDomain('cap-collectif.com');

        $senderEmailDomain->getValue()->shouldBe('cap-collectif.com');
        $senderEmailDomain->getService()->shouldBe('mailjet');
        $senderEmailDomain->getDkimValidation()->shouldBe(false);
        $senderEmailDomain->getSpfValidation()->shouldBe(true);
        $senderEmailDomain->getTxtKey()->shouldBe('mailjetToken');
        $senderEmailDomain->getTxtValue()->shouldBe('mailjetTokenValue');
        $senderEmailDomain->getTxtValidation()->shouldBe(false);
    }

    public function it_get_non_existing_domain(Client $client)
    {
        $exception = new \Exception('', 404);
        $this->client = $client;
        $client
            ->get('https://api.mailjet.com/v3/REST/dns/cap-collectif-test.com', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
            ])
            ->willThrow($exception);

        $this->getSenderEmailDomain('cap-collectif-test.com')->shouldBeNull();
    }

    public function it_get_all_domains(Client $client, Response $response)
    {
        $alpha = new \stdClass();
        $alpha->Domain = 'cap-collectif.com';
        $alpha->SPFStatus = 'OK';
        $alpha->DKIMStatus = 'KO';
        $alpha->OwnerShipToken = 'mailjetTokenValue';
        $alpha->OwnerShipTokenRecordName = 'mailjetToken';
        $beta = new \stdClass();
        $beta->Domain = 'cap-collectifv2.com';
        $beta->SPFStatus = 'KO';
        $beta->DKIMStatus = 'KO';
        $beta->OwnerShipToken = 'mailjetTokenValueV2';
        $beta->OwnerShipTokenRecordName = 'mailjetTokenV2';
        $body = new \stdClass();
        $body->Data = [$alpha, $beta];
        $response->getBody()->willReturn(json_encode($body));
        $this->client = $client;
        $client
            ->get('https://api.mailjet.com/v3/REST/dns', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
            ])
            ->willReturn($response);

        $senderEmailDomains = $this->getSenderEmailDomains();

        $senderEmailDomains->shouldBeArray();
        $senderEmailDomains->shouldHaveCount(2);
        $senderEmailDomains->shouldHaveKey('cap-collectif.com');
        $senderEmailDomains->shouldHaveKey('cap-collectifv2.com');
        $alphaDomain = $senderEmailDomains['cap-collectif.com'];
        $alphaDomain->shouldBeAnInstanceOf(SenderEmailDomain::class);
        $alphaDomain->getValue()->shouldBe('cap-collectif.com');
        $alphaDomain->getService()->shouldBe('mailjet');
        $alphaDomain->getDkimValidation()->shouldBe(false);
        $alphaDomain->getSpfValidation()->shouldBe(true);
        $alphaDomain->getTxtKey()->shouldBe('mailjetToken');
        $alphaDomain->getTxtValue()->shouldBe('mailjetTokenValue');
        $alphaDomain->getTxtValidation()->shouldBe(false);
        $betaDomain = $senderEmailDomains['cap-collectifv2.com'];
        $betaDomain->shouldBeAnInstanceOf(SenderEmailDomain::class);
        $betaDomain->getValue()->shouldBe('cap-collectifv2.com');
        $betaDomain->getService()->shouldBe('mailjet');
        $betaDomain->getDkimValidation()->shouldBe(false);
        $betaDomain->getSpfValidation()->shouldBe(false);
        $betaDomain->getTxtKey()->shouldBe('mailjetTokenV2');
        $betaDomain->getTxtValue()->shouldBe('mailjetTokenValueV2');
        $betaDomain->getTxtValidation()->shouldBe(false);
    }

    public function it_creates_domain(Client $client)
    {
        $exception = new \Exception('', 404);
        $this->client = $client;
        $client
            ->get('https://api.mailjet.com/v3/REST/dns/cap-collectif.com', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
            ])
            ->willThrow($exception)
            ->shouldBeCalled();
        $client
            ->post('https://api.mailjet.com/v3/REST/sender', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
                'body' => json_encode(['Email' => '*@cap-collectif.com']),
            ])
            ->willReturn(new Response('201'))
            ->shouldBeCalled();
        $domain = new SenderEmailDomain();
        $domain->setValue('cap-collectif.com');
        $domain->setService('mailjet');

        $result = $this->createSenderDomain($domain);

        $result->getValue()->shouldBe('cap-collectif.com');
        $result->getService()->shouldBe('mailjet');
        $result->getDkimValidation()->shouldBe(false);
        $result->getSpfValidation()->shouldBe(false);
    }

    public function it_creates_but_already_exist(Client $client, Response $response)
    {
        $domainData = new \stdClass();
        $domainData->Domain = 'cap-collectif.com';
        $domainData->SPFStatus = 'OK';
        $domainData->DKIMStatus = 'KO';
        $domainData->OwnerShipToken = 'mailjetTokenValue';
        $domainData->OwnerShipTokenRecordName = 'mailjetToken';
        $body = new \stdClass();
        $body->Data = [$domainData];
        $response->getBody()->willReturn(json_encode($body));
        $this->client = $client;
        $client
            ->get('https://api.mailjet.com/v3/REST/dns/cap-collectif.com', [
                'auth' => ['publicKey', 'privateKey'],
                'headers' => [
                    'content-type' => 'application/json',
                ],
            ])
            ->willReturn($response)
            ->shouldBeCalled();
        $domain = new SenderEmailDomain();
        $domain->setValue('cap-collectif.com');
        $domain->setService('mailjet');

        $result = $this->createSenderDomain($domain);

        $result->getValue()->shouldBe('cap-collectif.com');
        $result->getService()->shouldBe('mailjet');
        $result->getDkimValidation()->shouldBe(false);
        $result->getSpfValidation()->shouldBe(true);
    }
}
