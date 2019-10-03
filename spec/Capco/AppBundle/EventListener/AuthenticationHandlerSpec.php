<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\EventListener\AuthenticationHandler;
use Capco\AppBundle\Repository\UserConnectionRepository;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class AuthenticationHandlerSpec extends ObjectBehavior
{
    public function let(UserConnectionRepository $userConnectionRepository, LoggerInterface $logger)
    {
        $this->beConstructedWith($userConnectionRepository, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationHandler::class);
    }

    public function it_should_failed_with_password_error(
        UserConnectionRepository $userConnectionRepository,
        Request $request,
        AuthenticationException $exception
    ) {
        $request
            ->getContent()
            ->shouldBeCalled()
            ->willReturn('{"username": "lbrunet@jolicode.com"}');
        $test = $userConnectionRepository
            ->countAttemptByEmailInLastHour('lbrunet@jolicode.com', false)
            ->shouldBeCalled()
            ->getObjectProphecy();
        $this->onAuthenticationFailure($request, $exception)->shouldBeAnInstanceOf(
            new JsonResponse(
                ['reason' => AuthenticationHandler::BAD_CREDENTIALS, 'failedAttempts' => $test],
                401
            )
        );
    }
}
