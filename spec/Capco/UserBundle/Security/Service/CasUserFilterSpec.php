<?php

namespace spec\Capco\UserBundle\Security\Service;

use Capco\UserBundle\Security\Service\CasUserFilter;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;

class CasUserFilterSpec extends ObjectBehavior
{
    public function it_should_return_false_for_authorized_user()
    {
        // create a mock and queue two responses.
        $mock = new MockHandler([
            new Response(200,  ['Content-Type' => 'application/xml'], 'false'),
            new Response(200,  ['Content-Type' => 'application/xml'], 'false'),
        ]);

        $handlerStack = HandlerStack::create($mock);
        $client = new Client(['handler' => $handlerStack]);

        // The first request is intercepted with the first response.
        $client->post('***REMOVED***', [
            'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
            'body' => '<IdentificationRequest>
                              <login>RomaneA</login>
                          </IdentificationRequest>'

        ]);
        // The second request is intercepted with the second response.
        $client->post('***REMOVED***', [
            'verify' => false, // deactivate ssl verification because server certificate not valid put it true otherwise
            'body' => '<IdentificationRequest>
                              <login>HUV76</login>
                          </IdentificationRequest>'

        ]);

    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CasUserFilter::class);
    }

    public function let(LoggerInterface $logger)
    {
        $url = '***REMOVED***';
        $this->beConstructedWith($logger, $url);
    }

}