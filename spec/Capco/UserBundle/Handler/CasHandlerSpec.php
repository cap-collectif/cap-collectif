<?php

namespace spec\Capco\UserBundle\Handler;

use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\UserBundle\Handler\CasHandler;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CasHandlerSpec extends ObjectBehavior
{
    //    public function it_can_be_login_with_cas_and_be_redirect_to_given_destination()
    //    {
    //        $destination = 'https://capco.dev';
    //        $response = $this->login($destination);
    //        $response->shouldBeAnInstanceOf(RedirectResponse::class);
    //        $response->headers->get('location')->shouldBe($destination);
    //    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CasHandler::class);
    }

    public function let(
        SessionInterface $session,
        CASSSOConfigurationRepository $repository,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($session, $logger, $repository, 'prod');
    }
}
