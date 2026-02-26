<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\Capco\UserBundle\OpenID\ReferrerResolver\KeycloakReferrerResolver;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\UserBundle\Security\Http\Logout\Handler\OpenIDLogoutHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpFoundation\Session\Storage\MockArraySessionStorage;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpenIDLogoutHandlerSpec extends ObjectBehavior
{
    public function it_is_initializable(
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        AbstractSSOConfigurationRepository $repository,
        EntityManagerInterface $em
    ) {
        $this->beConstructedWith(
            $resourceOwner,
            $router,
            $referrerResolver,
            $tokenStorage,
            $repository,
            $em
        );

        $this->shouldHaveType(OpenIDLogoutHandler::class);
    }

    public function it_redirects_to_configured_post_logout_redirect_uri(
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        AbstractSSOConfigurationRepository $repository,
        EntityManagerInterface $em,
        OAuthToken $token
    ) {
        $this->beConstructedWith(
            $resourceOwner,
            $router,
            $referrerResolver,
            $tokenStorage,
            $repository,
            $em
        );

        $oauth2 = (new Oauth2SSOConfiguration())
            ->setDisconnectSsoOnLogout(true)
            ->setPostLogoutRedirectUri('https://capco.dev/projects')
        ;

        $repository->findOneByType('oauth2', true)->willReturn($oauth2);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('openid');
        $token->getUser()->willReturn(new \stdClass());
        $token->getRawToken()->willReturn(['id_token' => 'id-token']);

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout')
        ;
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $referrerResolver->getRefererParameterForLogout()->willReturn('post_logout_redirect_uri');
        $referrerResolver->getRefererResolver()->willReturn(new KeycloakReferrerResolver());

        $request = Request::create('/logout');
        $request->setSession(new Session(new MockArraySessionStorage()));

        $responseWithRequest = new RedirectResponseWithRequest($request, new RedirectResponse('https://capco.dev'));
        $expected = $responseWithRequest;
        $expected
            ->getResponse()
            ->setTargetUrl(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout?' .
                    http_build_query(
                        [
                            'post_logout_redirect_uri' => 'https://capco.dev/projects',
                            'id_token_hint' => 'id-token',
                        ],
                        '',
                        '&'
                    )
            )
        ;

        $this->handle($responseWithRequest)->shouldReturn($expected);
    }

    public function it_falls_back_to_homepage_when_post_logout_redirect_uri_is_not_configured(
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        AbstractSSOConfigurationRepository $repository,
        EntityManagerInterface $em,
        OAuthToken $token
    ) {
        $this->beConstructedWith(
            $resourceOwner,
            $router,
            $referrerResolver,
            $tokenStorage,
            $repository,
            $em
        );

        $oauth2 = (new Oauth2SSOConfiguration())->setDisconnectSsoOnLogout(true);

        $repository->findOneByType('oauth2', true)->willReturn($oauth2);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('openid');
        $token->getUser()->willReturn(new \stdClass());
        $token->getRawToken()->willReturn([]);

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout')
        ;
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $referrerResolver->getRefererParameterForLogout()->willReturn('post_logout_redirect_uri');
        $referrerResolver->getRefererResolver()->willReturn(new KeycloakReferrerResolver());

        $request = Request::create('/logout');
        $request->setSession(new Session(new MockArraySessionStorage()));

        $responseWithRequest = new RedirectResponseWithRequest($request, new RedirectResponse('https://capco.dev'));
        $expected = $responseWithRequest;
        $expected
            ->getResponse()
            ->setTargetUrl(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout?' .
                    http_build_query(['post_logout_redirect_uri' => 'https://capco.dev'], '', '&')
            )
        ;

        $this->handle($responseWithRequest)->shouldReturn($expected);
    }

    public function it_keeps_switch_user_logout_behavior(
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        AbstractSSOConfigurationRepository $repository,
        EntityManagerInterface $em,
        OAuthToken $token
    ) {
        $this->beConstructedWith(
            $resourceOwner,
            $router,
            $referrerResolver,
            $tokenStorage,
            $repository,
            $em
        );

        $oauth2 = (new Oauth2SSOConfiguration())
            ->setDisconnectSsoOnLogout(true)
            ->setPostLogoutRedirectUri('https://capco.dev/projects')
        ;

        $repository->findOneByType('oauth2', true)->willReturn($oauth2);
        $tokenStorage->getToken()->willReturn($token);
        $token->getResourceOwnerName()->willReturn('openid');
        $token->getUser()->willReturn(new \stdClass());
        $token->getRawToken()->willReturn(['id_token' => 'id-token']);

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn('https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout')
        ;
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $referrerResolver->getRefererParameterForLogout()->willReturn('post_logout_redirect_uri');
        $referrerResolver->getRefererResolver()->willReturn(new KeycloakReferrerResolver());

        $request = Request::create('/logout', 'GET', ['ssoSwitchUser' => true]);
        $request->setSession(new Session(new MockArraySessionStorage()));

        $responseWithRequest = new RedirectResponseWithRequest($request, new RedirectResponse('https://capco.dev'));
        $expected = $responseWithRequest;
        $expected
            ->getResponse()
            ->setTargetUrl(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout?' .
                    http_build_query(
                        [
                            'post_logout_redirect_uri' => 'https://capco.dev/login/openid?_destination=https://capco.dev',
                            'id_token_hint' => 'id-token',
                        ],
                        '',
                        '&'
                    )
            )
        ;

        $this->handle($responseWithRequest)->shouldReturn($expected);
    }
}
