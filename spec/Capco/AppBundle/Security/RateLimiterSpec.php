<?php

namespace spec\Capco\AppBundle\Security;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Security\RateLimiter;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Cache\ItemInterface;

class RateLimiterSpec extends ObjectBehavior
{
    public function let(RedisCache $cache, LoggerInterface $logger)
    {
        $this->beConstructedWith($cache, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(RateLimiter::class);
    }

    public function it_should_be_true_on_first_try(RedisCache $cache, ItemInterface $cachedItem)
    {
        $this->prepareMocks(null, 1, $cachedItem, $cache);
        $cachedItem
            ->expiresAfter(60)
            ->shouldBeCalled()
            ->willReturn($cachedItem);

        $this->canDoAction('someAction', '123456')->shouldBe(true);
    }

    public function it_should_be_true_up_to_10_tries(RedisCache $cache, ItemInterface $cachedItem)
    {
        $this->prepareMocks(9, 10, $cachedItem, $cache);

        $this->canDoAction('someAction', '123456')->shouldBe(true);
    }

    public function it_should_be_false_over_10_tries(RedisCache $cache, ItemInterface $cachedItem)
    {
        $this->prepareMocks(10, 'RATE_LIMIT_REACHED', $cachedItem, $cache);
        $cachedItem
            ->expiresAfter(300)
            ->shouldBeCalled()
            ->willReturn($cachedItem);

        $this->canDoAction('someAction', '123456')->shouldBe(false);
    }

    public function it_should_be_false_over_N_tries(RedisCache $cache, ItemInterface $cachedItem)
    {
        $specificLimit = 3;
        $this->prepareMocks($specificLimit, 'RATE_LIMIT_REACHED', $cachedItem, $cache);
        $cachedItem
            ->expiresAfter(300)
            ->shouldBeCalled()
            ->willReturn($cachedItem);

        $this->setLimit($specificLimit);
        $this->canDoAction('someAction', '123456')->shouldBe(false);
    }

    public function it_should_be_true_with_redis_reserved_characters(
        RedisCache $cache,
        ItemInterface $cachedItem,
        LoggerInterface $logger
    ) {
        $this->prepareMocks(null, 1, $cachedItem, $cache);
        $cachedItem
            ->expiresAfter(60)
            ->shouldBeCalled()
            ->willReturn($cachedItem);

        $this->canDoAction('someAction', '123:456')->shouldBe(true);
    }

    /**
     * @param $existingCachedValue
     * @param $newCachedValue
     * @param $cachedItem
     * @param $cache
     */
    private function prepareMocks($existingCachedValue, $newCachedValue, $cachedItem, $cache): void
    {
        $cachedItem->get()->willReturn($existingCachedValue);
        $cachedItem->isHit()->willReturn(null !== $existingCachedValue);
        $cachedItem
            ->set($newCachedValue)
            ->shouldBeCalled()
            ->willReturn($cachedItem);

        $cache
            ->getItem(RateLimiter::USER_CACHE_KEY . '-someAction-123456')
            ->shouldBeCalled()
            ->willReturn($cachedItem);
        $cache->save(Argument::type(ItemInterface::class))->shouldBeCalled();
    }
}
