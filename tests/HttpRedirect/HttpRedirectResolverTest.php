<?php

namespace Capco\Tests\HttpRedirect;

use Capco\AppBundle\Cache\RedisCache;
use Capco\AppBundle\Cache\SameRequestCache;
use Capco\AppBundle\Entity\HttpRedirect;
use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\HttpRedirect\HttpRedirectResolver;
use Capco\AppBundle\Repository\HttpRedirectRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Cache\Adapter\ArrayAdapter;
use Symfony\Component\HttpFoundation\Request;

/**
 * @internal
 * @coversNothing
 */
class HttpRedirectResolverTest extends TestCase
{
    public function testItCachesTheSameQueryVariantAfterResolvingTheBaseRule(): void
    {
        $redirect = (new HttpRedirect())
            ->setSourceUrl('/go')
            ->setDestinationUrl('https://capco.dev/projects')
            ->setDuration(HttpRedirectDuration::TEMPORARY)
            ->setRedirectType(HttpRedirectType::URL_SHORTENING)
        ;

        $repository = $this->createMock(HttpRedirectRepository::class);
        $repository
            ->expects(self::exactly(2))
            ->method('findMatching')
            ->willReturnMap([
                ['/go', '/go', $redirect],
                ['/go', '/go?utm_source=newsletter', $redirect],
            ])
        ;

        $resolver = new HttpRedirectResolver(
            $repository,
            $this->createRedisCacheMock(),
            new SameRequestCache()
        );

        $firstResolve = $resolver->resolve(Request::create('/go'));
        $secondResolve = $resolver->resolve(Request::create('/go?utm_source=newsletter'));
        $thirdResolve = $resolver->resolve(Request::create('/go?utm_source=newsletter'));

        self::assertNotNull($firstResolve);
        self::assertSame('https://capco.dev/projects', $firstResolve->getDestinationUrl());
        self::assertNotNull($secondResolve);
        self::assertSame('https://capco.dev/projects', $secondResolve->getDestinationUrl());
        self::assertNotNull($thirdResolve);
        self::assertSame('https://capco.dev/projects', $thirdResolve->getDestinationUrl());
    }

    public function testItDoesNotShadowAQuerySpecificRedirectWithABaseRuleCachedFirst(): void
    {
        $baseRedirect = (new HttpRedirect())
            ->setSourceUrl('/go')
            ->setDestinationUrl('https://capco.dev/projects')
            ->setDuration(HttpRedirectDuration::TEMPORARY)
            ->setRedirectType(HttpRedirectType::URL_SHORTENING)
        ;

        $queryRedirect = (new HttpRedirect())
            ->setSourceUrl('/go?lang=fr')
            ->setDestinationUrl('https://capco.dev/projets')
            ->setDuration(HttpRedirectDuration::TEMPORARY)
            ->setRedirectType(HttpRedirectType::URL_SHORTENING)
        ;

        $repository = $this->createMock(HttpRedirectRepository::class);
        $repository
            ->expects(self::exactly(2))
            ->method('findMatching')
            ->willReturnMap([
                ['/go', '/go', $baseRedirect],
                ['/go', '/go?lang=fr', $queryRedirect],
            ])
        ;

        $resolver = new HttpRedirectResolver(
            $repository,
            $this->createRedisCacheMock(),
            new SameRequestCache()
        );

        $firstResolve = $resolver->resolve(Request::create('/go'));
        $secondResolve = $resolver->resolve(Request::create('/go?lang=fr'));

        self::assertNotNull($firstResolve);
        self::assertSame('https://capco.dev/projects', $firstResolve->getDestinationUrl());
        self::assertNotNull($secondResolve);
        self::assertSame('https://capco.dev/projets', $secondResolve->getDestinationUrl());
    }

    private function createRedisCacheMock(): RedisCache
    {
        $storage = new ArrayAdapter();
        $redisCache = $this->getMockBuilder(RedisCache::class)
            ->disableOriginalConstructor()
            ->onlyMethods(['getItem', 'save'])
            ->getMock()
        ;

        $redisCache
            ->method('getItem')
            ->willReturnCallback(static fn (string $key) => $storage->getItem($key))
        ;
        $redisCache
            ->method('save')
            ->willReturnCallback(static fn ($item) => $storage->save($item))
        ;

        return $redisCache;
    }
}
