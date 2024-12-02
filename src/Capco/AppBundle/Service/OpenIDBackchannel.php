<?php

namespace Capco\AppBundle\Service;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Security\SessionWithJsonHandler;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Serializer\SerializerInterface;

class OpenIDBackchannel
{
    public function __construct(private readonly UserRepository $userRepository, private readonly SessionWithJsonHandler $redisSessionHandler, private readonly EntityManagerInterface $entityManager, private readonly SerializerInterface $serializer, private readonly string $env, private readonly string $backChannelSecret, private readonly LoggerInterface $logger)
    {
    }

    public function __invoke(Request $request, string $token): JsonResponse
    {
        if (!$this->checkToken($token)) {
            $this->logger->error(__METHOD__ . "token {$token} UNAUTHORIZED");

            return $this->json(
                [
                    'success' => false,
                    'reason' => 'UNAUTHORIZED',
                ],
                403
            );
        }

        $content = $request->getContent();

        $accessToken = explode('logout_token=', $content)[1];

        list($user, $openIdSID) = $this->findUser($accessToken);
        if (!$user instanceof User) {
            $this->logger->error(__METHOD__ . 'USER_NOT_FOUND');

            return $this->json(
                [
                    'success' => false,
                    'reason' => 'USER_NOT_FOUND',
                ],
                404
            );
        }
        if (!$user->hasOpenIdSession($openIdSID)) {
            $this->logger->error(__METHOD__ . "{$openIdSID} BAD_CREDENTIAL");

            return $this->json(
                [
                    'success' => false,
                    'reason' => 'BAD_CREDENTIAL',
                ],
                403
            );
        }

        return $this->processToDeleteUserRedisSession($user, $openIdSID);
    }

    public static function getUserInfoFromAccessToken(string $accessToken): array
    {
        $userInfoBase64Encoded = explode('.', $accessToken)[1];
        $userInfoJsonEncoded = base64_decode($userInfoBase64Encoded);

        return json_decode($userInfoJsonEncoded, true);
    }

    public function findUser(string $accessToken): array
    {
        $userInfo = self::getUserInfoFromAccessToken($accessToken);

        return [
            $this->userRepository->findOneByOpenIdSID($userInfo['sid']),
            $userInfo['sid'],
        ];
    }

    public function processToDeleteUserRedisSession(
        User $user,
        string $openIdSID,
        bool $flush = true
    ): JsonResponse {
        $sessionId = $user->getSessionFromOpenIdSessionId($openIdSID);
        // already disconnected, return success
        if (!$sessionId) {
            return $this->json(
                [
                    'success' => true,
                    'reason' => null,
                ],
                201
            );
        }
        $redisKey = $this->redisSessionHandler->getRedisKey($sessionId);
        $client = $this->redisSessionHandler->getClient();
        $success = $client->del($redisKey);
        if ($success) {
            $user->removeOpenIdSession($openIdSID);
            if ($flush) {
                $this->entityManager->flush();
            }
        }

        return $this->json(
            [
                'success' => (bool) $success,
                'reason' => null,
            ],
            201
        );
    }

    protected function json(
        $data,
        int $status = 200,
        array $headers = [],
        array $context = []
    ): JsonResponse {
        $json = $this->serializer->serialize(
            $data,
            'json',
            array_merge(
                [
                    'json_encode_options' => JsonResponse::DEFAULT_ENCODING_OPTIONS,
                ],
                $context
            )
        );

        return new JsonResponse($json, $status, $headers, true);
    }

    private function checkToken(string $secret): bool
    {
        // if we dont have changed the default token, we cant access at this route
        if (\in_array($this->backChannelSecret, ['secret', 'INSERT_REAL_SECRET', ''])) {
            throw new AccessDeniedException('Please change the secret');
        }

        if ($secret !== $this->backChannelSecret) {
            return false;
        }

        return true;
    }
}
