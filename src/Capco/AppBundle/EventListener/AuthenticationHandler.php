<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\UserConnectionRepository;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationHandler implements AuthenticationFailureHandlerInterface
{
    final public const BAD_CREDENTIALS = 'Bad credentials.';

    public function __construct(
        private readonly UserConnectionRepository $userConnectionRepository,
        private readonly LoggerInterface $logger,
        private readonly RequestGuesserInterface $requestGuesser
    ) {
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $data = $this->requestGuesser->getJsonContent();
        $email = $data['username'] ?? '';
        $failedAttempts = $this->userConnectionRepository->countFailedAttemptByEmailAndIPInLastHour(
            $email,
            $this->requestGuesser->getClientIp()
        );
        $this->logger->warning(
            'Une tentative de connection ratée a été réalisée sur l\'adresse email',
            ['email' => $email]
        );

        return new JsonResponse(
            ['reason' => self::BAD_CREDENTIALS, 'failedAttempts' => $failedAttempts],
            401
        );
    }
}
