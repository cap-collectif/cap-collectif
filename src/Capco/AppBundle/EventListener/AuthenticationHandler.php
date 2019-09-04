<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Repository\UserConnectionRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class AuthenticationHandler implements AuthenticationFailureHandlerInterface
{
    public const BAD_CREDENTIALS = 'Bad credentials.';
    /**
     * @var UserConnectionRepository
     */
    private $userConnectionRepository;

    public function __construct(UserConnectionRepository $userConnectionRepository)
    {
        $this->userConnectionRepository = $userConnectionRepository;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['username'] ?? '';
        $failedAttempts = $this->userConnectionRepository->countAttemptByEmailInLastHour(
            $email,
            false
        );

        return new JsonResponse(
            ['reason' => self::BAD_CREDENTIALS, 'failedAttempts' => $failedAttempts],
            401
        );
    }
}
