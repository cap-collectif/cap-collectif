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


    public function __construct(EntityManagerInterface $entityManager){
        $this->userConnectionRepository = $entityManager->getRepository(UserConnection::class);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception)
    {
        if ($request === null || $exception->getMessage() !== self::BAD_CREDENTIALS){
            return new JsonResponse(['reason' => $exception->getMessage()], 500);
        }
        $data = json_decode($request->getContent(), true);
        $email = $data['username'] ?? '';
        $failedAttempts = $this->userConnectionRepository->countByEmailInLastHour($email);
        if ($failedAttempts >= 5){
            return new JsonResponse([
                'reason' => self::BAD_CREDENTIALS,
                'too_many_attempts' => true
            ], 401);
        }

        return new JsonResponse(['reason' => self::BAD_CREDENTIALS], 401);
    }
}
