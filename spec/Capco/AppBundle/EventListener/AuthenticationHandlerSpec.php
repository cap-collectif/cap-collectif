<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\EventListener\AuthenticationHandler;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class AuthenticationHandlerSpec extends ObjectBehavior
{
    public function let(
        UserConnectionRepository $userConnectionRepository,
        LoggerInterface $logger,
        RequestGuesserInterface $requestGuesser
    ) {
        $this->beConstructedWith($userConnectionRepository, $logger, $requestGuesser);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationHandler::class);
    }

    public function it_should_failed_with_password_error(
        UserConnectionRepository $userConnectionRepository,
        Request $request,
        RequestGuesserInterface $requestGuesser,
        AuthenticationException $exception
    ) {
        $requestGuesser
            ->getJsonContent()
            ->shouldBeCalled()
            ->willReturn(['username' => 'lbrunet@cap-collectif.com'])
        ;

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2')
        ;

        $test = $userConnectionRepository
            ->countFailedAttemptByEmailAndIPInLastHour('lbrunet@cap-collectif.com', '192.168.64.2')
            ->shouldBeCalled()
            ->getObjectProphecy()
        ;
        $this->onAuthenticationFailure($request, $exception)->shouldBeAnInstanceOf(
            new JsonResponse(
                ['reason' => AuthenticationHandler::BAD_CREDENTIALS, 'failedAttempts' => $test],
                401
            )
        );
    }
}
