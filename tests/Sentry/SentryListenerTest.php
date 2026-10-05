<?php

declare(strict_types=1);

namespace Capco\Tests\Sentry;

use Capco\AppBundle\Sentry\SentryListener;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Sentry\State\HubInterface;
use Sentry\State\Scope;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\User;

/**
 * @internal
 *
 * @coversNothing
 */
final class SentryListenerTest extends TestCase
{
    public function testSupportsStatelessUser(): void
    {
        $scope = new Scope();
        $hub = $this->createMock(HubInterface::class);
        $hub
            ->expects(self::once())
            ->method('configureScope')
            ->willReturnCallback(static function (callable $callback) use ($scope): void {
                $callback($scope);
            })
        ;

        $security = $this->createMock(Security::class);
        $security->method('getUser')->willReturn(new User('dev', null, ['ROLE_INTERNAL_HUB']));

        $listener = new SentryListener($hub, $security, new NullLogger());
        $listener->onKernelRequest(new RequestEvent(
            $this->createMock(HttpKernelInterface::class),
            Request::create('/graphql/internal'),
            HttpKernelInterface::MAIN_REQUEST
        ));

        $userData = $scope->getUser();
        self::assertNotNull($userData);
        self::assertSame('dev', $userData->getUsername());
        self::assertNull($userData->getEmail());
    }
}
