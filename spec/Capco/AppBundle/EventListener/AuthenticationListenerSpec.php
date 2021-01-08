<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\EventListener\AuthenticationListener;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\HeaderBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

class AuthenticationListenerSpec extends ObjectBehavior
{
    public function let(EntityManagerInterface $entityManager, RequestStack $requestStack)
    {
        $this->beConstructedWith($entityManager, $requestStack);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationListener::class);
    }

    public function it_should_saved_failed_connection_attempt(
        EntityManagerInterface $entityManager,
        RequestStack $requestStack,
        AuthenticationFailureEvent $event,
        Request $request
    ) {
        $headerBag = new HeaderBag(['user-agent' => 'TEST']);
        $requestStack
            ->getMasterRequest()
            ->shouldBeCalled()
            ->willReturn($request);

        $request
            ->getContent()
            ->shouldBeCalled()
            ->willReturn('{"username": "lbrunet@cap-collectif.com"}');
        $request
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');
        $request->headers = $headerBag;

        $expectedUserConnection = new UserConnection();
        $expectedUserConnection->setDatetime(new \DateTime());
        $expectedUserConnection->setSuccess(false);
        $expectedUserConnection->setEmail('lbrunet@cap-collectif.com');
        $expectedUserConnection->setNavigator('TEST');
        $expectedUserConnection->setIpAddress('192.168.64.2');

        $this->onAuthenticationFailure($event);
        $entityManager
            ->persist(
                Argument::that(function ($userConnection) use ($expectedUserConnection) {
                    return $userConnection->isSuccess() === $expectedUserConnection->isSuccess() &&
                        $userConnection->getEmail() === $expectedUserConnection->getEmail() &&
                        $userConnection->getIpAddress() ===
                            $expectedUserConnection->getIpAddress() &&
                        $userConnection->getNavigator() === $expectedUserConnection->getNavigator();
                })
            )
            ->shouldBeCalled();
        $entityManager->flush()->shouldBeCalled();
    }

    public function it_should_saved_successful_connection_attempt(
        EntityManagerInterface $entityManager,
        InteractiveLoginEvent $event,
        Request $request,
        UserInterface $user,
        Session $session,
        OAuthToken $tokenInterface
    ) {
        $headerBag = new HeaderBag(['user-agent' => 'TEST']);
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
        $request
            ->getContent()
            ->shouldBeCalled()
            ->willReturn('{"username": "lbrunet@cap-collectif.com"}');
        $request
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');
        $request->headers = $headerBag;

        $expectedUserConnection = new UserConnection();
        $expectedUserConnection->setDatetime(new \DateTime());
        $expectedUserConnection->setSuccess(true);
        $expectedUserConnection->setEmail('lbrunet@cap-collectif.com');
        $expectedUserConnection->setNavigator('TEST');
        $expectedUserConnection->setIpAddress('192.168.64.2');

        $this->onAuthenticationSuccess($event);
        $entityManager
            ->persist(
                Argument::that(function ($userConnection) use ($expectedUserConnection): bool {
                    return $userConnection->isSuccess() === $expectedUserConnection->isSuccess() &&
                        $userConnection->getEmail() === $expectedUserConnection->getEmail() &&
                        $userConnection->getIpAddress() ===
                            $expectedUserConnection->getIpAddress() &&
                        $userConnection->getNavigator() === $expectedUserConnection->getNavigator();
                })
            )
            ->shouldBeCalled();
        $entityManager->flush()->shouldBeCalled();
    }
}
