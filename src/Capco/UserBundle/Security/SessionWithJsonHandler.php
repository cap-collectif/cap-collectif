<?php

namespace Capco\UserBundle\Security;

// TODO: We could switch no native Symfony but it does not support locking, and we are using it…
// Please, one day use Symfony\Component\HttpFoundation\Session\Storage\Handler\RedisSessionHandler instead.
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Predis\ClientInterface;
use Snc\RedisBundle\Session\Storage\Handler\RedisSessionHandler as BaseHandler;
use Symfony\Component\Security\Core\Security;

/**
 * SessionWithJsonHandler add a Json string used by our NodeJS apps.
 * This way we can read some session data in NodeJS.
 */
class SessionWithJsonHandler extends BaseHandler
{
    public const SEPARATOR = '___JSON_SESSION_SEPARATOR__';
    private Security $security;

    public function __construct(
        ClientInterface $redis,
        Security $security,
        array $options = [],
        string $prefix
    ) {
        $options['ttl'] = 1209600; // This is two weeks
        $options['prefix'] = $prefix;
        // /!\ Our session data should be "read-only" :
        // we use parallel requests and want to avoid cascading requests.
        //
        // Unfortunately we are currently using some flash messages that write in the session,
        // so we are stuck until we fix this…
        //
        // TODO https://github.com/cap-collectif/platform/issues/12189
        $locking = true;

        parent::__construct($redis, $options, $prefix, $locking);
        $this->security = $security;
    }

    /**
     * $sessionId: string
     * $data: string.
     *
     * We must return 1 to avoid session_close errors
     *
     * @param mixed $sessionId
     * @param mixed $data
     *
     * @return bool
     */
    public function write($sessionId, $data)
    {
        $viewer = $this->getUser();

        return parent::write($sessionId, $this->encode($data, $viewer));
    }

    public function getClient(): ClientInterface
    {
        return $this->redis;
    }

    public function getRedisKey($key)
    {
        return parent::getRedisKey($key);
    }

    /**
     * $sessionId: string.
     *
     * @param mixed $sessionId
     *
     * @return string
     */
    public function read($sessionId)
    {
        $encodedSession = parent::read($sessionId);

        return $this->decode($encodedSession);
    }

    public function encode(string $rawPhpSession, ?User $viewer): string
    {
        $encodedSession = $rawPhpSession . self::SEPARATOR;
        if ($viewer) {
            $encodedSession .= json_encode([
                'viewer' => [
                    'email' => $viewer->getEmail(),
                    'username' => $viewer->getUsername(),
                    'id' => GlobalId::toGlobalId('User', $viewer->getId()),
                    'isAdmin' => $viewer->isAdmin(),
                    'isSuperAdmin' => $viewer->isSuperAdmin(),
                    'isProjectAdmin' => $viewer->isProjectAdmin(),
                    'isAdminOrganization' => $viewer->isAdminOrganization(),
                    'isOrganizationMember' => $viewer->isOrganizationMember(),
                    'isMediator' => $viewer->isMediator(),
                    'organization' => $viewer->getMemberOfOrganizations()->isEmpty()
                        ? null
                        : GlobalId::toGlobalId(
                            'Organization',
                            $viewer
                                ->getMemberOfOrganizations()
                                ->first()
                                ->getOrganization()
                                ->getId()
                        ),
                ],
            ]);
        }

        return $encodedSession;
    }

    public function decode(string $encodedSession): string
    {
        if (0 == \strlen($encodedSession)) {
            return '';
        }

        $decodedArray = explode(self::SEPARATOR, $encodedSession);

        if (!$decodedArray || !isset($decodedArray[0])) {
            return '';
        }

        return $decodedArray[0];
    }

    // See: https://symfony.com/doc/current/session/proxy_examples.html#read-only-guest-sessions
    private function getUser(): ?User
    {
        $user = $this->security->getUser();
        if ($user instanceof User) {
            return $user;
        }

        return null;
    }
}
