<?php

namespace spec\Capco\AppBundle\Mailer\SenderEmailDomains;

use Capco\AppBundle\Entity\SenderEmailDomain;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use PhpSpec\ObjectBehavior;

class MandrillClientSpec extends ObjectBehavior
{
    public function let()
    {
        $this->beConstructedWith('key');
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(MandrillClient::class);
    }

    public function it_convert_data_to_domain()
    {
        $spf = new \stdClass();
        $spf->valid = true;
        $dkim = new \stdClass();
        $dkim->valid = false;
        $data = new \stdClass();
        $data->domain = 'cap-collectif.com';
        $data->spf = $spf;
        $data->dkim = $dkim;
        $data->verify_txt_key = 'mandrillTxtValue';
        $data->valid_signing = false;

        $senderEmailDomain = $this->senderEmailDomainFromData($data);

        $senderEmailDomain->getValue()->shouldBe('cap-collectif.com');
        $senderEmailDomain->getService()->shouldBe('mandrill');
        $senderEmailDomain->getDkimValidation()->shouldBe(false);
        $senderEmailDomain->getSpfValidation()->shouldBe(true);
        $senderEmailDomain->getTxtKey()->shouldBe('mandrill_verify');
        $senderEmailDomain->getTxtValue()->shouldBe('mandrillTxtValue');
        $senderEmailDomain->getTxtValidation()->shouldBe(false);
    }

    public function it_get_all_domains(Client $client, Response $response)
    {
        $alphaSpf = new \stdClass();
        $alphaSpf->valid = true;
        $alphaDkim = new \stdClass();
        $alphaDkim->valid = false;
        $alpha = new \stdClass();
        $alpha->domain = 'cap-collectif.com';
        $alpha->spf = $alphaSpf;
        $alpha->dkim = $alphaDkim;
        $alpha->verify_txt_key = 'mandrillTxtValue';
        $alpha->valid_signing = false;

        $betaSpf = new \stdClass();
        $betaSpf->valid = false;
        $betaDkim = new \stdClass();
        $betaDkim->valid = false;
        $beta = new \stdClass();
        $beta->domain = 'cap-collectifv2.com';
        $beta->spf = $betaSpf;
        $beta->dkim = $betaDkim;
        $beta->verify_txt_key = 'mandrillTxtValue';
        $beta->valid_signing = false;

        $response->getBody()->willReturn(json_encode([$alpha, $beta]));
        $this->client = $client;
        $client
            ->post('https://mandrillapp.com/api/1.0/senders/domains', [
                'headers' => [
                    'content-type' => 'application/json',
                ],
                'body' => json_encode(['key' => 'key']),
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
        $alphaDomain->getService()->shouldBe('mandrill');
        $alphaDomain->getDkimValidation()->shouldBe(false);
        $alphaDomain->getSpfValidation()->shouldBe(true);
        $alphaDomain->getTxtKey()->shouldBe('mandrill_verify');
        $alphaDomain->getTxtValue()->shouldBe('mandrillTxtValue');
        $alphaDomain->getTxtValidation()->shouldBe(false);
        $betaDomain = $senderEmailDomains['cap-collectifv2.com'];
        $betaDomain->shouldBeAnInstanceOf(SenderEmailDomain::class);
        $betaDomain->getValue()->shouldBe('cap-collectifv2.com');
        $betaDomain->getService()->shouldBe('mandrill');
        $betaDomain->getDkimValidation()->shouldBe(false);
        $betaDomain->getSpfValidation()->shouldBe(false);
        $betaDomain->getTxtKey()->shouldBe('mandrill_verify');
        $betaDomain->getTxtValue()->shouldBe('mandrillTxtValue');
        $betaDomain->getTxtValidation()->shouldBe(false);
    }

    public function it_creates_domain(Client $client)
    {
        $this->client = $client;
        $client
            ->post('https://mandrillapp.com/api/1.0/senders/add-domain', [
                'headers' => [
                    'content-type' => 'application/json',
                ],
                'body' => json_encode(['domain' => 'cap-collectif.com', 'key' => 'key']),
            ])
            ->willReturn(
                new Response(
                    '201',
                    [],
                    json_encode([
                        'domain' => 'cap-collectif.com',
                        'spf' => ['valid' => false],
                        'dkim' => ['valid' => false],
                        'verify_txt_key' => 'mandrillTxtValue',
                        'valid_signing' => false,
                    ])
                )
            )
            ->shouldBeCalled();

        $domain = new SenderEmailDomain();
        $domain->setValue('cap-collectif.com');
        $domain->setService('mandrill');

        $result = $this->createSenderDomain($domain);

        $result->getValue()->shouldBe('cap-collectif.com');
        $result->getService()->shouldBe('mandrill');
        $result->getDkimValidation()->shouldBe(false);
        $result->getSpfValidation()->shouldBe(false);
        $result->getTxtKey()->shouldBe('mandrill_verify');
        $result->getTxtValue()->shouldBe('mandrillTxtValue');
        $result->getTxtValidation()->shouldBe(false);
    }
}
