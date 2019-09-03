<?php


namespace spec\Capco\AppBundle\Listener;


use Capco\AppBundle\EventListener\AuthenticationHandler;
use Doctrine\ORM\EntityManager;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class AuthenticationHandlerSpec extends ObjectBehavior
{
    function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationHandler::class);
    }

    function let(EntityManager $entityManager)
    {
        $this->beConstructedWith($entityManager);
    }

    public function it_should_failed_with_password_error(Request $request, AuthenticationException $exception){

        $exception->getMessage()->shouldBeCalled()->willReturn(AuthenticationHandler::BAD_CREDENTIALS);
//        $request->getContent()->shouldBeCalled()->willReturn(['username' => 'lbrunet@jolicode.com']);
        $this->onAuthenticationFailure($request, $exception);
    }

//    public function it_should_failed_with_server_error(Request $request, AuthenticationException $exception){
//
//        $exception->getMessage()->shouldBeCalled()->willReturn('server error');
//        $this->onAuthenticationFailure($request, $exception);
//    }

}
