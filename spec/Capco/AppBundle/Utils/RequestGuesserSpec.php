<?php

namespace spec\Capco\AppBundle\Utils;

use Capco\AppBundle\Utils\RequestGuesser;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Request tests are inspired by https://github.com/symfony/symfony/blob/5.4/src/Symfony/Component/HttpFoundation/Tests/RequestTest.php.
 */
class RequestGuesserSpec extends ObjectBehavior
{
    public const IP_TO_GUESS = '1.2.3.4';
    public const UA_TO_GUESS = 'Google Chrome';

    public function let(RequestStack $requestStack)
    {
        $this->beConstructedWith($requestStack);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(RequestGuesser::class);
    }

    public function it_should_return_cf_ip_if_header_1_present(RequestStack $requestStack): void
    {
        $request = new Request();
        $request->initialize([], [], [], [], [], ['HTTP_TRUE_CLIENT_IP' => self::IP_TO_GUESS]);
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getClientIp($request)->shouldReturn(self::IP_TO_GUESS);
    }

    public function it_should_return_cf_ip_if_header_2_present(RequestStack $requestStack): void
    {
        $request = new Request();
        $request->initialize([], [], [], [], [], ['HTTP_CF_CONNECTING_IP' => self::IP_TO_GUESS]);
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getClientIp($request)->shouldReturn(self::IP_TO_GUESS);
    }

    public function it_should_return_ip_if_present(RequestStack $requestStack): void
    {
        $request = new Request();
        $server = ['REMOTE_ADDR' => self::IP_TO_GUESS];

        $request->initialize([], [], [], [], [], $server);
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getClientIp($request)->shouldReturn(self::IP_TO_GUESS);
    }

    public function it_should_return_null_if_nb_ip_header_is_present(
        RequestStack $requestStack
    ): void {
        $request = new Request();
        $request->initialize([], [], [], [], [], []);
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getClientIp($request)->shouldReturn(null);
    }

    public function it_should_return_content_as_json(
        RequestStack $requestStack,
        Request $request
    ): void {
        $request->getContent()->willReturn('{"username":"toto"}');
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getJsonContent($request)->shouldReturn(['username' => 'toto']);
    }

    public function it_should_return_content_as_null_if_not_decoded(
        RequestStack $requestStack,
        Request $request
    ): void {
        $request->getContent()->willReturn(null);
        $requestStack->getCurrentRequest()->willReturn($request);
        $this->getJsonContent($request)->shouldReturn(null);

        $request->getContent()->willReturn('');
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getJsonContent($request)->shouldReturn(null);
    }

    public function it_should_return_user_agent(RequestStack $requestStack): void
    {
        $request = new Request();
        $request->initialize([], [], [], [], [], ['HTTP_USER_AGENT' => self::UA_TO_GUESS]);
        $requestStack->getCurrentRequest()->willReturn($request);

        $this->getUserAgent($request)->shouldReturn(self::UA_TO_GUESS);
    }
}
