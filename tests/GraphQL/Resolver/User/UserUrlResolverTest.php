<?php

namespace Capco\Tests\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

/**
 * @internal
 * @covers \Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver
 */
class UserUrlResolverTest extends TestCase
{
    public function testGetBySlugReturnsNullForEmptySlug(): void
    {
        $router = $this->createMock(RouterInterface::class);
        $router->expects($this->never())->method('generate');

        $resolver = new UserUrlResolver($router);

        $this->assertNull($resolver->getBySlug(''));
    }

    public function testGetBySlugGeneratesAbsoluteProfileUrl(): void
    {
        $router = $this->createMock(RouterInterface::class);
        $router->expects($this->once())
            ->method('generate')
            ->with(
                'capco_user_profile_show_all',
                ['slug' => 'jane-doe'],
                UrlGeneratorInterface::ABSOLUTE_URL
            )
            ->willReturn('https://capco.test/profile/jane-doe')
        ;

        $resolver = new UserUrlResolver($router);

        $this->assertSame('https://capco.test/profile/jane-doe', $resolver->getBySlug('jane-doe'));
    }
}
