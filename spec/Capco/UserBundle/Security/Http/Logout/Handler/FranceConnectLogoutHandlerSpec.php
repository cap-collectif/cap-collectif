<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Security\Http\Logout\Handler\FranceConnectLogoutHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;

class FranceConnectLogoutHandlerSpec extends ObjectBehavior
{
    public function it_should_redirect_to_france_connect_logout_page_with_correct_parameters(
        Manager $manager,
        FranceConnectResourceOwner $resourceOwner,
        RouterInterface $router,
        TokenStorage $tokenStorage,
        OAuthToken $token
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $tokenStorage, $router);

        $manager->isActive('login_franceconnect')->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('franceconnect');
        $token->getRawToken()->willReturn(['id_token' => 'abc123']);

        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://fcp.integ01.dev-franceconnect.fr/api/v1/logout')
        ;

        $request = new Request();
        $request->setSession(new Session(new MockArraySessionStorage()));

        $expectedRedirectResponseWithRequest = $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $expectedRedirectResponseWithRequest
            ->getResponse()
            ->setTargetUrl(
                'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout?' .
                    http_build_query(
                        [
                            'post_logout_redirect_uri' => 'https://capco.dev',
                            'state' => 'abc123',
                            'id_token_hint' => 'abc123',
                        ],
                        '',
                        '&'
                    )
            )
        ;

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $expectedRedirectResponseWithRequest
        );
    }

    public function it_should_not_to_touch_redirect_response_when_france_connect_is_not_enabled(
        Manager $manager,
        FranceConnectResourceOwner $resourceOwner,
        RouterInterface $router,
        TokenStorage $tokenStorage,
        OAuthToken $token
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $tokenStorage, $router);

        $manager->isActive('login_franceconnect')->willReturn(false);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('franceconnect');
        $token->getRawToken()->willReturn(['id_token' => 'abc123']);

        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://fcp.integ01.dev-franceconnect.fr/api/v1/logout')
        ;

        $request = new Request();
        $request->setSession(new Session(new MockArraySessionStorage()));

        $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );
    }

    public function it_should_provide_a_simple_link_for_redirection_while_disconnecting(
        Manager $manager,
        FranceConnectResourceOwner $resourceOwner,
        RouterInterface $router,
        TokenStorage $tokenStorage,
        OAuthToken $token
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $tokenStorage, $router);

        $manager->isActive('login_franceconnect')->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('franceconnect');
        $token->getRawToken()->willReturn(['id_token' => 'abc123']);

        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://fcp.integ01.dev-franceconnect.fr/api/v1/logout')
        ;

        $expectedEncodedParameter = http_build_query(
            ['post_logout_redirect_uri' => 'https://capco.dev'],
            '',
            '&'
        );

        $this->getLogoutUrl()->shouldContain($expectedEncodedParameter);
    }

    public function it_should_redirect_to_france_connect_logout_page_when_session_requires_it(
        Manager $manager,
        FranceConnectResourceOwner $resourceOwner,
        RouterInterface $router,
        TokenStorage $tokenStorage
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $tokenStorage, $router);

        $manager->isActive('login_franceconnect')->willReturn(true);
        $tokenStorage->getToken()->willReturn(null);

        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://fcp.integ01.dev-franceconnect.fr/api/v1/logout')
        ;

        $request = new Request();
        $session = new Session(new MockArraySessionStorage());
        $session->set(FranceConnectLogoutHandler::SESSION_LOGOUT_REQUIRED_KEY, true);
        $session->set(FranceConnectLogoutHandler::SESSION_ID_TOKEN_KEY, 'abc123');
        $session->set(FranceConnectLogoutHandler::SESSION_POST_LOGOUT_REDIRECT_URL_KEY, 'https://capco.dev/profile/edit-profile#account');
        $request->setSession($session);

        $responseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $this->handle($responseWithRequest)->getResponse()->getTargetUrl()->shouldContain(
            'id_token_hint=abc123'
        );
    }
}
