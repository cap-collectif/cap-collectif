<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\UserConnectionRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationHandler implements AuthenticationFailureHandlerInterface
{
    public const BAD_CREDENTIALS = 'Bad credentials.';

    private $userConnectionRepository;
    private $logger;

    public function __construct(
        UserConnectionRepository $userConnectionRepository,
        LoggerInterface $logger
    ) {
        $this->userConnectionRepository = $userConnectionRepository;
        $this->logger = $logger;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['username'] ?? '';
        $failedAttempts = $this->userConnectionRepository->countFailedAttemptByEmailInLastHour(
            $email
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
