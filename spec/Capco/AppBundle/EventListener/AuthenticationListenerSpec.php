<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\EventListener\AuthenticationListener;
use Capco\AppBundle\Service\OpenIDBackchannel;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\UserBundle\Entity\User;
use DG\BypassFinals;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

BypassFinals::enable();

class AuthenticationListenerSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        RequestGuesser $requestGuesser,
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
        AuthenticationFailureEvent $event,
        RequestGuesser $requestGuesser
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
            Argument::that(function ($userConnection) {
                return false === $userConnection->isSuccess()
                    && 'lbrunet@cap-collectif.com' === $userConnection->getEmail()
                    && '192.168.64.2' === $userConnection->getIpAddress()
                    && 'TEST' === $userConnection->getNavigator();
            })
        )->shouldBeCalled();
        $em->flush()->shouldBeCalled();

        $this->onAuthenticationFailure($event);
    }

    public function it_should_saved_successful_connection_attempt(
        EntityManagerInterface $em,
        InteractiveLoginEvent $event,
        Request $request,
        RequestGuesser $requestGuesser,
        User $user,
        Session $session,
        OAuthToken $tokenInterface,
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
            ->getAuthenticationToken()
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
            Argument::that(function ($userConnection): bool {
                return true === $userConnection instanceof UserConnection
                    && $userConnection->isSuccess()
                    && 'lbrunet@cap-collectif.com' === $userConnection->getEmail()
                    && '192.168.64.2' === $userConnection->getIpAddress()
                    && 'TEST' === $userConnection->getNavigator();
            })
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
