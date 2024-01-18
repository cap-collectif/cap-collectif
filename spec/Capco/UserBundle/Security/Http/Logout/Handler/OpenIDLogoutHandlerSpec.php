<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\OpenID\OpenIDReferrerResolver;
use Capco\UserBundle\OpenID\OpenIDResourceOwner;
use Capco\UserBundle\Security\Http\Logout\Handler\OpenIDLogoutHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use DG\BypassFinals;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

BypassFinals::enable();

class OpenIDLogoutHandlerSpec extends ObjectBehavior
{
    public function let(
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
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(OpenIDLogoutHandler::class);
    }

    public function it_should_redirect_to_OpenID_logout_page_with_correct_parameters(
        Manager $manager,
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token,
        User $user,
        Session $session,
        RedirectResponseWithRequest $dummyRedirectResponseWithRequest,
        RedirectResponse $redirectResponse,
        Request $request
    ) {
        $request->getSession()->willReturn($session);
        $request->initialize(['ssoSwitchUser' => true]);
        $referrerResolver->getRefererParameterForLogout()->willReturn('next');
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
        $session->getId()->willReturn('<sessionID>');
        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('oauth2_switch_user')->willReturn(true);
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout'
            )
        ;

        $parameters = [
            'next' => 'https://capco.dev/login/openid?_destination=https://capco.dev/',
        ];
        $dummyRedirectResponseWithRequest->getRequest()->willReturn($request);
        $responseWithRequest = $dummyRedirectResponseWithRequest->getWrappedObject();

        $redirectResponse->getTargetUrl()->willReturn('https://capco.dev');
        $redirectResponse
            ->getTargetUrl()
            ->willReturn(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout?' .
                    http_build_query($parameters, '', '&')
            )
        ;

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn($responseWithRequest);
    }

    public function it_should__not_redirect_if_openid_is_not_enabled(
        Manager $manager,
        OpenIDResourceOwner $resourceOwner,
        RouterInterface $router,
        OpenIDReferrerResolver $referrerResolver,
        TokenStorageInterface $tokenStorage,
        TokenInterface $token,
        User $user,
        Session $session,
        RedirectResponseWithRequest $dummyRedirectResponseWithRequest,
        RedirectResponse $redirectResponse,
        Request $request
    ) {
        $referrerResolver->getRefererParameterForLogout()->willReturn('next');
        $request->getSession()->willReturn($session);
        $request->initialize(['ssoSwitchUser' => true]);
        $referrerResolver->getRefererParameterForLogout()->willReturn('next');
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
        $session->getId()->willReturn('<sessionID>');
        $manager->isActive('login_openid')->willReturn(false);
        $manager->isActive('oauth2_switch_user')->willReturn(true);
        $router
            ->generate('app_homepage', [], RouterInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $resourceOwner
            ->getOption('logout_url')
            ->willReturn(
                'https://keycloak.cap-collectif.com/realms/master/protocol/openid-connect/logout'
            )
        ;
        $dummyRedirectResponseWithRequest->getRequest()->willReturn($request);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(false);
        $manager->isActive('oauth2_switch_user')->willReturn(false);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('oauth2_switch_user')->willReturn(false);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );

        $manager->isActive('login_openid')->willReturn(true);
        $manager->isActive('oauth2_switch_user')->willReturn(true);
        $request->initialize([]);
        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $dummyRedirectResponseWithRequest
        );
    }
}
