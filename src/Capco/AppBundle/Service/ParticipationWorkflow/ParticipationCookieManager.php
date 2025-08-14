<?php

namespace Capco\AppBundle\Service\ParticipationWorkflow;

use Capco\AppBundle\Service\Encryptor;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class ParticipationCookieManager
{
    public const REPLY_COOKIE = 'CapcoAnonReply';
    public const PARTICIPANT_COOKIE = 'CapcoParticipant';

    private readonly Request $request;

    /**
     * @var string[]
     */
    private array $keys = [];

    public function __construct(private readonly Encryptor $encryptor, RequestStack $requestStack)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->keys = [self::REPLY_COOKIE, self::PARTICIPANT_COOKIE];
    }

    /**
     * Returns an encrypted JSON that regroups all the participation cookies in an array.
     */
    public function all(): string
    {
        $encryptedReplyCookie = $this->getEncryptedCookie(self::REPLY_COOKIE);
        $encryptedParticipantCookie = $this->getEncryptedCookie(self::PARTICIPANT_COOKIE);

        $json = json_encode(['replyCookie' => $encryptedReplyCookie, 'participantCookie' => $encryptedParticipantCookie]);

        return $this->encryptor->encryptData($json);
    }

    public function getEncryptedCookie(string $key): ?string
    {
        if (!\in_array($key, $this->keys)) {
            return null;
        }

        $cookie = $this->request->cookies->get($key);

        return $cookie ? $this->encryptor->encryptData($cookie) : null;
    }
}
