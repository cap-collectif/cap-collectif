<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\EventListener\AuthenticationListener;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Capco\AppBundle\Utils\RequestGuesser;

class AuthenticationListenerSpec extends ObjectBehavior
{
    public function let(EntityManagerInterface $entityManager, RequestGuesser $requestGuesser)
    {
        $this->beConstructedWith($entityManager, $requestGuesser);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationListener::class);
    }

    public function it_should_saved_failed_connection_attempt(
        EntityManagerInterface $entityManager,
        AuthenticationFailureEvent $event,
        RequestGuesser $requestGuesser
    ) {
        $requestGuesser
            ->getJsonContent()
            ->shouldBeCalled()
            ->willReturn(['username' => 'lbrunet@cap-collectif.com']);

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');

        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalled()
            ->willReturn('TEST');

        $entityManager
            ->persist(
                Argument::that(function ($userConnection) {
                    return false === $userConnection->isSuccess() &&
                        'lbrunet@cap-collectif.com' === $userConnection->getEmail() &&
                        '192.168.64.2' === $userConnection->getIpAddress() &&
                        'TEST' === $userConnection->getNavigator();
                })
            )
            ->shouldBeCalled();
        $entityManager->flush()->shouldBeCalled();

        $this->onAuthenticationFailure($event);
    }

    public function it_should_saved_successful_connection_attempt(
        EntityManagerInterface $entityManager,
        InteractiveLoginEvent $event,
        Request $request,
        RequestGuesser $requestGuesser,
        UserInterface $user,
        Session $session,
        OAuthToken $tokenInterface
    ) {
        $event
            ->getRequest()
            ->shouldBeCalled()
            ->willReturn($request);

        $tokenInterface
            ->serialize()
            ->shouldBeCalled()
            ->willReturn(
                'a:7:{i:0;s:9:"sqdqsdsqd";i:1;a:1:{s:12:"access_token";s:9:"sqdqsdsqd";}i:2;s:7:"refresh";i:3;i:60;i:4;i:1596457723;i:5;N;i:6;a:5:{i:0;N;i:1;b:0;i:2;a:0:{}i:3;a:0:{}i:4;a:0:{}}}'
            );
        $event
            ->getAuthenticationToken()
            ->shouldBeCalled()
            ->willReturn($tokenInterface);

        $request
            ->getSession()
            ->shouldBeCalled()
            ->willReturn($session);
        $session
            ->set(
                'theToken',
                'a:7:{i:0;s:9:"sqdqsdsqd";i:1;a:1:{s:12:"access_token";s:9:"sqdqsdsqd";}i:2;s:7:"refresh";i:3;i:60;i:4;i:1596457723;i:5;N;i:6;a:5:{i:0;N;i:1;b:0;i:2;a:0:{}i:3;a:0:{}i:4;a:0:{}}}'
            )
            ->shouldBeCalled();

        $tokenInterface
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $requestGuesser
            ->getJsonContent()
            ->shouldBeCalled()
            ->willReturn(['username' => 'lbrunet@cap-collectif.com']);
        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');
        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalled()
            ->willReturn('TEST');

        $entityManager
            ->persist(
                Argument::that(function ($userConnection): bool {
                    return true === $userConnection->isSuccess() &&
                        'lbrunet@cap-collectif.com' === $userConnection->getEmail() &&
                        '192.168.64.2' === $userConnection->getIpAddress() &&
                        'TEST' === $userConnection->getNavigator();
                })
            )
            ->shouldBeCalled();
        $entityManager->flush()->shouldBeCalled();

        $this->onAuthenticationSuccess($event);
    }
}
