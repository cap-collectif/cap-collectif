<?php

namespace spec\Capco\UserBundle\Security\Service;

use Capco\UserBundle\Repository\UserTypeRepository;
use Capco\UserBundle\Security\Service\CapebUserFilter;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class CapebUserFilterSpec extends ObjectBehavior
{
    public function it_should_return_false_for_authorized_user()
    {
        // create a mock and queue two responses.
        $mock = new MockHandler([
            new Response(200, ['Content-Type' => 'application/xml'], 'false'),
            new Response(200, ['Content-Type' => 'application/xml'], 'false'),
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);

        // The first request is intercepted with the first response.
        $client->post('https://CAS_URL/WebService/call', [
            'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
            'body' => '<IdentificationRequest>
                              <login>RomaneA</login>
                          </IdentificationRequest>',
        ]);
        // The second request is intercepted with the second response.
        $client->post('https://CAS_URL/WebService/call', [
            'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
            'body' => '<IdentificationRequest>
                              <login>HUV76</login>
                          </IdentificationRequest>',
        ]);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CapebUserFilter::class);
    }

    public function let(LoggerInterface $logger, UserTypeRepository $userTypeRepository)
    {
        $url = 'https://CAS_URL/WebService/call';
        $this->beConstructedWith($logger, $userTypeRepository, $url);
    }
}
