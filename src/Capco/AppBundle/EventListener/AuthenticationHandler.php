<?php

namespace Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\Repository\UserConnectionRepository;
use Doctrine\ORM\EntityManagerInterface;
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

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->userConnectionRepository = $entityManager->getRepository(UserConnection::class);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        if (null === $request || self::BAD_CREDENTIALS !== $exception->getMessage()) {
            return new JsonResponse(['reason' => $exception->getMessage()], 500);
        }
        $data = json_decode($request->getContent(), true);
        $email = $data['username'] ?? '';
        $failedAttempts = $this->userConnectionRepository->countFailedAttemptByEmailInLastHour(
            $email
        );

        return new JsonResponse(
            ['reason' => self::BAD_CREDENTIALS, 'failedAttempts' => $failedAttempts],
            401
        );
    }
}
