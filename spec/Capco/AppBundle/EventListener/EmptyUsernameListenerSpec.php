<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\EventListener\EmptyUsernameListener;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Twig\Environment;

class EmptyUsernameListenerSpec extends ObjectBehavior
{
    public function let(TokenStorageInterface $tokenStorage, Environment $templating)
    {
        $this->beConstructedWith($tokenStorage, $templating);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(EmptyUsernameListener::class);
    }

    public function it_not_load_view(
        RequestEvent $event,
        TokenStorageInterface $tokenStorage,
        User $user,
        Request $request,
        TokenInterface $token
    ) {
        $event->isMasterRequest()->willReturn(false);
        $this->onKernelRequest($event);

        $event->isMasterRequest()->willReturn(true);
        $tokenStorage->getToken()->willReturn(null);
        $this->onKernelRequest($event);
    }

    public function it_return_null_if_username(
        RequestEvent $event,
        TokenStorageInterface $tokenStorage,
        User $user,
        Request $request,
        TokenInterface $token
    ) {
        $event->isMasterRequest()->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);

        $user->getUsername()->willReturn('username');
        $this->onKernelRequest($event);
    }

    public function it_return_null_if_in_routes(
        RequestEvent $event,
        TokenStorageInterface $tokenStorage,
        User $user,
        Request $request,
        TokenInterface $token
    ) {
        $event->isMasterRequest()->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
        $event->getRequest()->willReturn($request);
        $request->get('_route')->willReturn('login_check');
        $this->onKernelRequest($event);
    }

    public function it_return_view(
        RequestEvent $event,
        TokenStorageInterface $tokenStorage,
        User $user,
        Request $request,
        TokenInterface $token,
        Environment $templating
    ) {
        $event->isMasterRequest()->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
        $event->getRequest()->willReturn($request);
        $request->get('_route')->willReturn('app_homepage');

        $templating
            ->render('@CapcoApp/Default/choose_a_username.html.twig')
            ->willReturn('choose_a_username.html.twig')
        ;

        $response = new Response('choose_a_username.html.twig');
        $event->setResponse($response)->shouldBeCalled();

        $this->onKernelRequest($event);
    }

    public function it_return_view_if_username_is_null_or_none(
        RequestEvent $event,
        TokenStorageInterface $tokenStorage,
        User $user,
        Request $request,
        TokenInterface $token,
        Environment $templating
    ) {
        $event->isMasterRequest()->willReturn(true);
        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($user);
        $event->getRequest()->willReturn($request);
        $request->get('_route')->willReturn('app_homepage');

        $templating
            ->render('@CapcoApp/Default/choose_a_username.html.twig')
            ->willReturn('choose_a_username.html.twig')
        ;

        $response = new Response('choose_a_username.html.twig');
        $event->setResponse($response)->shouldBeCalled();

        $user->getUsername()->willReturn('');
        $this->onKernelRequest($event);
        $user->getUsername()->willReturn(null);
        $this->onKernelRequest($event);
    }
}
