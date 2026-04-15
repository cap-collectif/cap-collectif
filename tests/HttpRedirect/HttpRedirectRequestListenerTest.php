<?php

namespace Capco\Tests\HttpRedirect;

use Capco\AppBundle\Enum\HttpRedirectDuration;
use Capco\AppBundle\Enum\HttpRedirectType;
use Capco\AppBundle\HttpRedirect\HttpRedirectRequestListener;
use Capco\AppBundle\HttpRedirect\HttpRedirectResolver;
use Capco\AppBundle\HttpRedirect\ResolvedHttpRedirection;
use Capco\AppBundle\Toggle\Manager;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * @internal
 * @coversNothing
 */
class HttpRedirectRequestListenerTest extends TestCase
{
    private MockObject & Manager $toggleManager;
    private MockObject & HttpRedirectResolver $httpRedirectResolver;
    private HttpRedirectRequestListener $listener;

    protected function setUp(): void
    {
        $this->toggleManager = $this->createMock(Manager::class);
        $this->httpRedirectResolver = $this->createMock(HttpRedirectResolver::class);
        $this->listener = new HttpRedirectRequestListener(
            $this->toggleManager,
            $this->httpRedirectResolver
        );
    }

    public function testItSkipsResolutionWhenFeatureFlagIsEnabled(): void
    {
        $event = $this->createRequestEvent(Request::create('/projects'));

        $this->toggleManager
            ->expects(self::once())
            ->method('isActive')
            ->with('http_redirects')
            ->willReturn(true)
        ;
        $this->httpRedirectResolver->expects(self::never())->method('resolve');

        $this->listener->onKernelRequest($event);

        self::assertNull($event->getResponse());
    }

    public function testItSetsARedirectResponseWhenARuleMatches(): void
    {
        $request = Request::create('/projects');
        $event = $this->createRequestEvent($request);

        $this->toggleManager
            ->expects(self::once())
            ->method('isActive')
            ->with('http_redirects')
            ->willReturn(false)
        ;
        $this->httpRedirectResolver
            ->expects(self::once())
            ->method('resolve')
            ->with($request)
            ->willReturn(new ResolvedHttpRedirection(
                'https://capco.dev/test',
                HttpRedirectDuration::PERMANENT,
                HttpRedirectType::REDIRECTION
            ))
        ;

        $this->listener->onKernelRequest($event);

        $response = $event->getResponse();

        self::assertNotNull($response);
        self::assertSame(301, $response->getStatusCode());
        self::assertSame('https://capco.dev/test', $response->headers->get('Location'));
    }

    private function createRequestEvent(Request $request): RequestEvent
    {
        return new RequestEvent(
            $this->createMock(HttpKernelInterface::class),
            $request,
            HttpKernelInterface::MAIN_REQUEST
        );
    }
}
