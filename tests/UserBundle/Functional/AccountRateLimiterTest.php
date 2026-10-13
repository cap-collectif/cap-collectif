<?php

declare(strict_types=1);

namespace Capco\Tests\UserBundle\Functional;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Exception\RecentlySentException;
use Capco\AppBundle\Security\RateLimiter;
use Capco\AppBundle\Service\EmailRateLimiter;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Exercises public limiter rules with isolated cache storage and stubs at external boundaries.
 */
final class AccountRateLimiterTest extends TestCase
{
    public function testActionLimitIsIsolatedByActionAndIdentity(): void
    {
        $limiter = new RateLimiter($this->cache(), new NullLogger(), $this->kernel('prod'));
        $limiter->setLimit(3);
        for ($attempt = 0; $attempt < 3; ++$attempt) {
            self::assertTrue($limiter->canDoAction('register', 'identity-one'));
        }
        self::assertFalse($limiter->canDoAction('register', 'identity-one'));
        self::assertFalse($limiter->canDoAction('register', 'identity-one'));
        self::assertTrue($limiter->canDoAction('register', 'identity-two'));
        self::assertTrue($limiter->canDoAction('email-change', 'identity-one'));
    }

    public function testEmailLimitBlocksImmediateRepeatButAllowsOtherAddress(): void
    {
        $limiter = new EmailRateLimiter($this->cache(), new NullLogger(), $this->kernel('prod'));
        $limiter->rateLimit('first-email');
        $limiter->rateLimit('second-email');
        $this->expectException(RecentlySentException::class);
        $limiter->rateLimit('first-email');
    }

    public function testExpiredEmailLimitAllowsAnotherRequest(): void
    {
        $cache = $this->cache();
        $limiter = new EmailRateLimiter($cache, new NullLogger(), $this->kernel('prod'));
        // Expire a limit created through the public API, without waiting on a clock.
        $limiter->rateLimit('expired-email', -1);
        $limiter->rateLimit('expired-email');
        $this->expectException(RecentlySentException::class);
        $limiter->rateLimit('expired-email');
    }

    public function testTestEnvironmentDeliberatelyBypassesBothLimiters(): void
    {
        $cache = $this->cache();
        $kernel = $this->kernel('test');
        $limiter = new RateLimiter($cache, new NullLogger(), $kernel);
        $limiter->setLimit(1);
        self::assertTrue($limiter->canDoAction('register', 'identity'));
        self::assertTrue($limiter->canDoAction('register', 'identity'));
        $emailLimiter = new EmailRateLimiter($cache, new NullLogger(), $kernel);
        $emailLimiter->rateLimit('email');
        $emailLimiter->rateLimit('email');
    }

    private function cache(): RedisCache
    {
        $pool = new ArrayAdapter();
        $cache = $this->createStub(RedisCache::class);
        $cache->method('getItem')->willReturnCallback($pool->getItem(...));
        $cache->method('save')->willReturnCallback($pool->save(...));

        return $cache;
    }

    private function kernel(string $environment): KernelInterface
    {
        $kernel = $this->createStub(KernelInterface::class);
        $kernel->method('getEnvironment')->willReturn($environment);

        return $kernel;
    }
}
