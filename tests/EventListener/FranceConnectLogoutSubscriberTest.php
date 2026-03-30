<?php

namespace Capco\Tests\EventListener;

use Capco\AppBundle\EventListener\FranceConnectLogoutSubscriber;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @internal
 * @covers \FranceConnectLogoutSubscriber
 *
 * @uses \FranceConnectLogoutHandler::clearFranceConnectSession
 */
class FranceConnectLogoutSubscriberTest extends TestCase
{
    private FranceConnectLogoutHandler & MockObject $logoutHandler;
    private Manager & MockObject $toggleManager;
    private FranceConnectLogoutSubscriber $subscriber;

    protected function setUp(): void
    {
        $this->logoutHandler = $this->createMock(FranceConnectLogoutHandler::class);
        $this->toggleManager = $this->createMock(Manager::class);

        $this->subscriber = new FranceConnectLogoutSubscriber(
            $this->logoutHandler,
            $this->toggleManager
        );
    }

    /**
     * @covers \Capco\AppBundle\EventListener\FranceConnectLogoutSubscriber::onKernelRequest
     */
    public function testItRedirectsToFranceConnectLogoutWhenImmediateLogoutIsRequired(): void
    {
        $request = Request::create('https://capco.dev/profile/edit-profile#account');
        $request->setSession(new Session(new MockArraySessionStorage()));
        $request->getSession()->set(FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY, true);
        $request->getSession()->set(FranceConnectLogoutHandler::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY, true);
        $request->getSession()->set(FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY, 'id-token');
        $request->getSession()->set(
            FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY,
            'https://capco.dev/profile/edit-profile#account'
        );

        $kernel = $this->createMock(HttpKernelInterface::class);
        $event = new RequestEvent($kernel, $request, HttpKernelInterface::MAIN_REQUEST);

        $this->toggleManager
            ->expects($this->once())
            ->method('isActive')
            ->with('login_franceconnect')
            ->willReturn(true)
        ;
        $this->logoutHandler
            ->expects($this->once())
            ->method('getLogoutUrl')
            ->with(null, 'https://capco.dev/profile/edit-profile#account', $request)
            ->willReturn('https://franceconnect.example/logout')
        ;

        $this->subscriber->onKernelRequest($event);

        $this->assertNotNull($event->getResponse());
        $this->assertSame('https://franceconnect.example/logout', $event->getResponse()->headers->get('Location'));
        $this->assertFalse($request->getSession()->has(FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY));
        $this->assertFalse($request->getSession()->has(FranceConnectLogoutHandler::SESSION_IMMEDIATE_LOGOUT_REQUIRED_KEY));
        $this->assertFalse($request->getSession()->has(FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY));
        $this->assertFalse($request->getSession()->has(FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY));
    }
}
