<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;

class OpenIDLogoutHandlerSpec extends ObjectBehavior
{
    public function it should redirect to OpenID logout page with correct parameters(
        Manager $manager,
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $router, $referrerResolver);

        $referrerResolver->getRefererParameterForLogout()->willReturn('next');

        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('disconnect_openid')->willReturn(true);
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev');

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn(
                'https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout'
            );

        $parameters = [
            'next' => 'https://capco.dev/login/openid?_destination=https://capco.dev/'
        ];

        $request = new Request(['ssoSwitchUser' => true]);

        $expectedRedirectResponseWithRequest = $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $expectedRedirectResponseWithRequest
            ->getResponse()
            ->setTargetUrl(
                'https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout?' .
                    http_build_query($parameters, '', '&')
            );

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $expectedRedirectResponseWithRequest
        );
    }

    public function it should  not redirect if openid is not enabled(
        Manager $manager,
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver
    ) {
        $this->beConstructedWith($manager, $resourceOwner, $router, $referrerResolver);

        $referrerResolver->getRefererParameterForLogout()->willReturn('next');

        $manager->isActive('login_openid')->willReturn(false);
        $manager->isActive('disconnect_openid')->willReturn(true);
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev');

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn(
                'https://keycloak.cap-collectif.com/auth/realms/master/protocol/openid-connect/logout'
            );

        $request = new Request(['ssoSwitchUser' => true]);

        $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(false);
        $manager->isActive('disconnect_openid')->willReturn(false);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('disconnect_openid')->willReturn(false);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('disconnect_openid')->willReturn(true);
        $request->query->remove('ssoSwitchUser');
        $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );
    }
}
