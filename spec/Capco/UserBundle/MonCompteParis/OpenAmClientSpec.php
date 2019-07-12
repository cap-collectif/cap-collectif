<?php

namespace spec\Capco\UserBundle\MonCompteParis;

use Capco\UserBundle\MonCompteParis\OpenAmClient;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Http\Client\Common\HttpMethodsClient;
use Psr\Log\LoggerInterface;
use Psr\Http\Message\ResponseInterface;

class OpenAmClientSpec extends ObjectBehavior
{
    function it_get_user_informations(HttpMethodsClient $client, LoggerInterface $logger, ResponseInterface $response)
    {
        $this->beConstructedWith($client, $logger);
        $this->setCookie('I_AM_COOKIE');

        $json = ["validatedAccount" => ["true"]];
        $client->get(OpenAmClient::API_INFORMATIONS_URL . 'admin@cap-collectif.com', ['Cookie' => 'mcpAuth=I_AM_COOKIE'])->shouldBeCalled()->willReturn($response);
        // Only retrieve interesting parts
        $response->getBody()->willReturn('{"validatedAccount":["true"]}');
        $this->getUserInformations('admin@cap-collectif.com')->shouldBe($json);
    }
}
