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
            ->with($lockKey, 1, ['NX', 'EX' => 5])
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
            ->method('del')
            ->with($lockKey)
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
