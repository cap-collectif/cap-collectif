<?php

namespace Capco\Tests\UserBundle\Security;

use Capco\UserBundle\Security\SessionWithJsonHandler;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Security;

/**
 * @internal
 * @covers \Capco\UserBundle\Security\SessionWithJsonHandler::read
 */
class SessionWithJsonHandlerTest extends TestCase
{
    public function testReadReleasesLockWhenSessionIsInactive(): void
    {
        $redis = $this->createMock(\Redis::class);
        $security = $this->createMock(Security::class);
        $logger = $this->createMock(LoggerInterface::class);

        $sessionId = 'session-id';
        $lockKey = 'session_lock_' . $sessionId;
        $expiredSession = '_sf2_attributes|a:0:{}' . SessionWithJsonHandler::SEPARATOR . '{"last_user_activity":0}';

        $redis
            ->expects($this->once())
            ->method('set')
            ->with(
                $lockKey,
                $this->callback(static fn (string $lockToken): bool => 32 === \strlen($lockToken) && ctype_xdigit($lockToken)),
                ['NX', 'EX' => 5]
            )
            ->willReturn(true)
        ;
        $redis
            ->expects($this->once())
            ->method('get')
            ->with($sessionId)
            ->willReturn($expiredSession)
        ;
        $redis
            ->expects($this->once())
            ->method('unlink')
            ->with($sessionId)
            ->willReturn(1)
        ;
        $redis
            ->expects($this->once())
            ->method('eval')
            ->with(
                $this->stringContains('redis.call("get", KEYS[1])'),
                $this->callback(static fn (array $arguments): bool => $arguments[0] === $lockKey
                    && 32 === \strlen((string) $arguments[1])
                    && ctype_xdigit((string) $arguments[1])),
                1
            )
            ->willReturn(1)
        ;

        $handler = new SessionWithJsonHandler(
            $redis,
            $security,
            new RequestStack(),
            '',
            $logger,
            7200,
            7200,
            []
        );

        self::assertTrue($handler->open('', 'PHPSESSID'));
        self::assertSame('', $handler->read($sessionId));
    }
}
