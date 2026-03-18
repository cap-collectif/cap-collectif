<?php

namespace Capco\Tests\EventListener;

use Capco\AppBundle\EventListener\OpenIdCallbackTargetPathSubscriber;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @internal
 * @coversNothing
 */
class OpenIdCallbackTargetPathSubscriberTest extends TestCase
{
    private MockObject & HttpKernelInterface $kernel;
    private OpenIdCallbackTargetPathSubscriber $subscriber;

    protected function setUp(): void
    {
        $this->kernel = $this->createMock(HttpKernelInterface::class);
        $this->subscriber = new OpenIdCallbackTargetPathSubscriber(new NullLogger());
    }

    public function testItSavesTargetPathFromProjectReferer(): void
    {
        $request = $this->createCallbackRequest(
            'https://capco.dev/project/bp7/selection/laureats'
        );
        $event = new RequestEvent($this->kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $this->subscriber->onKernelRequest($event);

        self::assertSame(
            'https://capco.dev/project/bp7/selection/laureats',
            $request->getSession()->get('_security.main.target_path')
        );
    }

    public function testItExtractsDestinationFromOpenIdReferer(): void
    {
        $request = $this->createCallbackRequest(
            'https://capco.dev/login/openid?_destination=' .
            rawurlencode('https://capco.dev/project/bp7/selection/laureats')
        );
        $event = new RequestEvent($this->kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $this->subscriber->onKernelRequest($event);

        self::assertSame(
            'https://capco.dev/project/bp7/selection/laureats',
            $request->getSession()->get('_security.main.target_path')
        );
    }

    public function testItIgnoresCrossHostReferer(): void
    {
        $request = $this->createCallbackRequest('https://budgetparticipatifecologique.smartidf.services/');
        $event = new RequestEvent($this->kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $this->subscriber->onKernelRequest($event);

        self::assertNull($request->getSession()->get('_security.main.target_path'));
    }

    public function testItIgnoresOpenIdProviderRefererOnSameHost(): void
    {
        $request = $this->createCallbackRequest(
            'https://capco.dev/realms/master/protocol/openid-connect/auth?client_id=platform'
        );
        $event = new RequestEvent($this->kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $this->subscriber->onKernelRequest($event);

        self::assertNull($request->getSession()->get('_security.main.target_path'));
    }

    private function createCallbackRequest(string $referer): Request
    {
        $request = Request::create(
            'https://capco.dev/login/check-openid?code=abc&session_state=xyz',
            Request::METHOD_GET,
            server: ['HTTP_REFERER' => $referer]
        );
        $request->setSession(new Session(new MockArraySessionStorage()));

        return $request;
    }
}
