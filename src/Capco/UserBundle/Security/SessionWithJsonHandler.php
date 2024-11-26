<?php

namespace Capco\UserBundle\Security;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Storage\Handler\RedisSessionHandler;
use Symfony\Component\Security\Core\Security;

/**
 * SessionWithJsonHandler adds a JSON string used by NodeJS apps.
 * This allows reading some session data in NodeJS.
 */
class SessionWithJsonHandler extends RedisSessionHandler
{
    final public const SEPARATOR = '___JSON_SESSION_SEPARATOR__';
    private readonly Security $security;
    private int $lockTimeout = 5;
    private string $lockKeyPrefix = 'session_lock_';
    private readonly \Redis $redis;
    private int $retryDelay = 10000;
    private int $maxRetries = 100;
    private readonly LoggerInterface $logger;
    private readonly RequestStack $requestStack;

    public function __construct(
        \Redis $redis,
        Security $security,
        RequestStack $requestStack,
        string $prefix,
        LoggerInterface $logger,
        array $options = []
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

        parent::__construct($redis, $options);
        $this->security = $security;
        $this->redis = $redis;
        $this->logger = $logger;
        $this->requestStack = $requestStack;
    }

    public function write($sessionId, $data): bool
    {
        $request = $this->requestStack->getCurrentRequest();

        if ($request && str_starts_with($request->getPathInfo(), '/_profiler')) {
            $this->logger->info('Skipping session write for WDT pages.');

            return true;
        }

        $this->acquireLock($sessionId);
        $viewer = $this->getUser();

        $encodedData = $this->encode($data, $viewer);
        $result = parent::write($sessionId, $encodedData);

        $this->releaseLock($sessionId);

        return $result;
    }

    public function read($sessionId): string
    {
        $this->acquireLock($sessionId);

        $encodedSession = parent::read($sessionId);
        $decodedSession = $this->decode($encodedSession);

        $this->releaseLock($sessionId);

        return $decodedSession;
    }

    public function encode(string $rawPhpSession, ?User $viewer): string
    {
        $encodedSession = $rawPhpSession . self::SEPARATOR;

        if ($viewer) {
            $viewerData = [
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
                        $viewer->getMemberOfOrganizations()->first()->getOrganization()->getId()
                    ),
            ];

            $encodedSession .= json_encode(['viewer' => $viewerData], \JSON_THROW_ON_ERROR);
        }

        return $encodedSession;
    }

    /**
     * Decode session data by splitting it from the JSON part.
     */
    public function decode(string $encodedSession): string
    {
        if (empty($encodedSession)) {
            return '';
        }

        $decodedArray = explode(self::SEPARATOR, $encodedSession);

        return $decodedArray[0] ?? '';
    }

    private function getUser(): ?User
    {
        $user = $this->security->getUser();

        return $user instanceof User ? $user : null;
    }

    /**
     * This function attempts to acquire a lock on a specific session by setting a unique key in Redis.
     * The lock is necessary to prevent multiple processes or requests from concurrently writing to the same session,
     * which could cause race conditions or data inconsistencies.
     *
     * - NX: The key will only be set if it does not already exist. This ensures that the lock is only acquired
     *       if no other process has already taken it.
     * - EX: The lock will automatically expire after a certain period (in seconds). Here, $this->lockTimeout defines
     *       how long the lock remains valid before it is automatically released.
     */
    private function acquireLock(string $sessionId): void
    {
        $lockKey = $this->lockKeyPrefix . $sessionId;
        $attempt = 0;

        while (!$this->redis->set($lockKey, 1, ['NX', 'EX' => $this->lockTimeout])) {
            if ($attempt >= $this->maxRetries) {
                throw new \RuntimeException('Unable to acquire session lock after multiple retries.');
            }

            usleep($this->retryDelay);
            ++$attempt;
        }
    }

    private function releaseLock(string $sessionId): void
    {
        $lockKey = $this->lockKeyPrefix . $sessionId;
        $this->redis->del($lockKey);
    }
}
