<?php

namespace spec\Capco\UserBundle\Security\Http\Logout\Handler;

use Capco\AppBundle\Entity\SSO\CASSSOConfiguration;
use Capco\AppBundle\Repository\CASSSOConfigurationRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Handler\CasHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\CASLogoutHandler;
use Capco\UserBundle\Security\Http\Logout\Handler\RedirectResponseWithRequest;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class CASLogoutHandlerSpec extends ObjectBehavior
{
    /**
     * @throws \Exception
     */
    public function it_should_logout_from_cas_and_redirect_to_given_url(
        Manager $manager,
        CASSSOConfiguration $configuration,
        RouterInterface $router
    ) {
        $manager->isActive('login_cas')->willReturn(true);
        $configuration->isEnabled()->willReturn(true);
        $session = new Session();
        $session->set('cas_login', 'fake-cas-id');
        $router
            ->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $parameters = [
            'service' => 'https://capco.dev',
        ];

        $request = new Request();
        $request->setSession($session);

        $expectedRedirectResponseWithRequest = $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $expectedRedirectResponseWithRequest
            ->getResponse()
            ->setTargetUrl('https://CAS_URL/cas/logout?' . http_build_query($parameters, '', '&'))
        ;

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $expectedRedirectResponseWithRequest
        );
    }

    /**
     * @throws \Exception
     */
    public function it_should_not_reach_cas_logout_when_cas_login_is_deactivated(
        Manager $manager,
        CASSSOConfiguration $configuration,
        RouterInterface $router
    ) {
        $manager->isActive('login_cas')->willReturn(true);
        $configuration->isEnabled()->willReturn(false);
        $router
            ->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL)
            ->willReturn('https://capco.dev')
        ;

        $request = new Request();
        $expectedRedirectResponseWithRequest = $dummyRedirectResponseWithRequest = new RedirectResponseWithRequest(
            $request,
            new RedirectResponse('https://capco.dev')
        );

        $expectedRedirectResponseWithRequest
            ->getResponse()
            ->setTargetUrl('https://CAS_URL/cas/logout')
        ;

        $this->handle($dummyRedirectResponseWithRequest)->shouldReturn(
            $expectedRedirectResponseWithRequest
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CASLogoutHandler::class);
    }

    public function let(
        Manager $manager,
        CASSSOConfigurationRepository $repository,
        CasHandler $casHandler
    ) {
        $this->beConstructedWith($manager, $repository, $casHandler);
    }
}
