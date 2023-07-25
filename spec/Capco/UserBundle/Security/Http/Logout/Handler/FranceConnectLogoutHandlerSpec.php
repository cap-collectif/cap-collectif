<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
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

        $parameters = [
            'post_logout_redirect_uri' => 'https://capco.dev',
            'state' => 'abc123',
            'id_token_hint' => 'abc123',
        ];

        $request = new Request();

        $expectedRedirectResponseWithRequest = $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $expectedRedirectResponseWithRequest
            ->getResponse()
            ->setTargetUrl(
                'https://fcp.integ01.dev-franceconnect.fr/api/v1/logout?' .
                    http_build_query($parameters, '', '&')
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
}
