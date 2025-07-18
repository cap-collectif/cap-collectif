<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\EventListener\AuthenticationListener;
use Capco\AppBundle\Service\OpenIDBackchannel;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;

class AuthenticationListenerSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        RequestGuesserInterface $requestGuesser,
        OpenIDBackchannel $openIDBackchannel,
        LoggerInterface $logger
    ) {
        $this->beConstructedWith($em, $requestGuesser, $openIDBackchannel, $logger);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(AuthenticationListener::class);
    }

    public function it_should_saved_failed_connection_attempt(
        EntityManagerInterface $em,
        LoginFailureEvent $event,
        RequestGuesserInterface $requestGuesser
    ) {
        $requestGuesser
            ->getJsonContent()
            ->shouldBeCalled()
            ->willReturn(['username' => 'lbrunet@cap-collectif.com'])
        ;

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2')
        ;

        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalled()
            ->willReturn('TEST')
        ;

        $em->persist(
            Argument::that(fn ($userConnection) => false === $userConnection->isSuccess()
                && 'lbrunet@cap-collectif.com' === $userConnection->getEmail()
                && '192.168.64.2' === $userConnection->getIpAddress()
                && 'TEST' === $userConnection->getNavigator())
        )->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->onAuthenticationFailure($event);
    }

    public function it_should_saved_successful_connection_attempt(
        EntityManagerInterface $em,
        LoginSuccessEvent $event,
        Request $request,
        RequestGuesserInterface $requestGuesser,
        User $user,
        Session $session,
        TokenInterface $tokenInterface,
        ParameterBag $query
    ) {
        $event
            ->getRequest()
            ->shouldBeCalled()
            ->willReturn($request)
        ;

        $tokenInterface
            ->serialize()
            ->shouldBeCalled()
            ->willReturn(
                'a:7:{i:0;s:9:"sqdqsdsqd";i:1;a:1:{s:12:"access_token";s:9:"sqdqsdsqd";}i:2;s:7:"refresh";i:3;i:60;i:4;i:1596457723;i:5;N;i:6;a:5:{i:0;N;i:1;b:0;i:2;a:0:{}i:3;a:0:{}i:4;a:0:{}}}'
            )
        ;
        $event
            ->getAuthenticatedToken()
            ->shouldBeCalled()
            ->willReturn($tokenInterface)
        ;
        $request
            ->getSession()
            ->shouldBeCalled()
            ->willReturn($session)
        ;
        $session
            ->set(
                'theToken',
                'a:7:{i:0;s:9:"sqdqsdsqd";i:1;a:1:{s:12:"access_token";s:9:"sqdqsdsqd";}i:2;s:7:"refresh";i:3;i:60;i:4;i:1596457723;i:5;N;i:6;a:5:{i:0;N;i:1;b:0;i:2;a:0:{}i:3;a:0:{}i:4;a:0:{}}}'
            )
            ->shouldBeCalled()
        ;

        $tokenInterface
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;
        $requestGuesser
            ->getJsonContent()
            ->shouldBeCalled()
            ->willReturn(['username' => 'lbrunet@cap-collectif.com'])
        ;
        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2')
        ;
        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalled()
            ->willReturn('TEST')
        ;

        $em->persist(
            Argument::that(fn ($userConnection): bool => true === $userConnection instanceof UserConnection
                && $userConnection->isSuccess()
                && 'lbrunet@cap-collectif.com' === $userConnection->getEmail()
                && '192.168.64.2' === $userConnection->getIpAddress()
                && 'TEST' === $userConnection->getNavigator())
        )->shouldBeCalled();

        $session->getId()->willReturn('sessionId');
        $request->initialize(['session_state' => '<session-state>']);
        $query->get('session_state')->willReturn('<session-state>');
        $request->query = $query;
        $userOpenIdSID = [];
        $user->setOpenIdSessionsId($userOpenIdSID)->willReturn($user->getWrappedObject());
        $user->getOpenIdSessionsId()->willReturn($userOpenIdSID);
        $user->hasOpenIdSession('<session-state>')->willReturn(false);
        $user
            ->addOpenIdSessionId('<session-state>', 'sessionId')
            ->willReturn($user)
            ->shouldBeCalled()
        ;

        $em->flush()->shouldBeCalled();

        $this->onAuthenticationSuccess($event);
    }
}
