<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\EventListener\AuthenticationListener;
use Capco\AppBundle\Service\OpenIDBackchannel;
use Capco\UserBundle\Entity\User;
use DG\BypassFinals;
use Doctrine\ORM\EntityManagerInterface;
use HWI\Bundle\OAuthBundle\Security\Core\Authentication\Token\OAuthToken;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Capco\AppBundle\Utils\RequestGuesser;

BypassFinals::enable();

class AuthenticationListenerSpec extends ObjectBehavior
{
    public function let(EntityManagerInterface $em, RequestGuesser $requestGuesser, OpenIDBackchannel $openIDBackchannel)
    {
        $this->beConstructedWith($em, $requestGuesser, $openIDBackchannel);
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
            ->willReturn(['username' => 'lbrunet@cap-collectif.com']);

        $requestGuesser
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');

        $requestGuesser
            ->getUserAgent()
            ->shouldBeCalled()
            ->willReturn('TEST');

        $em->persist(
            Argument::that(function ($userConnection) {
                return false === $userConnection->isSuccess() &&
                    'lbrunet@cap-collectif.com' === $userConnection->getEmail() &&
                    '192.168.64.2' === $userConnection->getIpAddress() &&
                    'TEST' === $userConnection->getNavigator();
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

        $em->persist(
            Argument::that(function ($userConnection): bool {
                return true === $userConnection instanceof UserConnection &&
                    $userConnection->isSuccess() &&
                    'lbrunet@cap-collectif.com' === $userConnection->getEmail() &&
                    '192.168.64.2' === $userConnection->getIpAddress() &&
                    'TEST' === $userConnection->getNavigator();
            })
        )->shouldBeCalled();

        $session->getId()->willReturn('sessionId');
        $user->getOpenIdAccessToken()
            ->willReturn('eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJpX2N0NHF2UHNOcjVvc0RQLVdyVWhRWHNja1R3dkZTbkhvWG9IZDFkdUlNIn0.CnsiaWF0IjoxNjUzOTE4OTgzLCJqdGkiOiI5MjU5MTVjNC00YmE1LTQxOWMtYjZhMy0wMmM0MzJkNGM1NzkiLCJpc3MiOiJodHRwczovL2tleWNsb2FrLmNhcC1jb2xsZWN0aWYuY29tL2F1dGgvcmVhbG1zL21hc3RlciIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5OTliY2VhYS01NmZmLTQ4ZGYtYWUxMi0yNjIwYzljNjhjZDAiLCJ0eXAiOiJMb2dvdXQiLCJzaWQiOiJlMTZjNGIyZC0xZDA3LTQyNzQtYjBhNS1lMjc3NTQzNGI0NTEiLCJldmVudHMiOnsiaHR0cDovL3NjaGVtYXMub3BlbmlkLm5ldC9ldmVudC9iYWNrY2hhbm5lbC1sb2dvdXQiOnt9LCJyZXZva2Vfb2ZmbGluZV9hY2Nlc3MiOnRydWV9fQ==.F_7XYY4IYizMa4TZqr5lLIXkxMbTlQoXwZUbserjj7v5s26Qf7aErj4w20qBQKZ6C8MHyUgXI303jma1JeRgA26uA8FoZnPCAXAWUbcOMg2RU4WapuY5rMbW4q0woNKBCWHIwHIIar03PantZEfvuMLceVbhv0lUpeTEv9NFn-65D2qfl8LMImp1XIEF5z5vo5jLEx7Nq2_4PDg3RljOeT4XiLB_q5zY5NO4hh-t7aIw6TZ66jedX3Ej1fpQ-d4V457P3Q99iAMK2OqnfIMtIPwq5mBt1AlsiU360ZQuL-oMkIL0zB-iMjfjWPD-Bv963X4V_5T0DCfbYyHex2XYHg
        ');
        $userOpenIdSID = [];
        $user->setOpenIdSessionsId($userOpenIdSID)->willReturn($user->getWrappedObject());
        $user->getOpenIdSessionsId()->willReturn($userOpenIdSID);
        $user->hasOpenIdSession("e16c4b2d-1d07-4274-b0a5-e2775434b451")->willReturn(false);
        $user
            ->addOpenIdSessionId( 'e16c4b2d-1d07-4274-b0a5-e2775434b451','sessionId')
            ->willReturn($user)
            ->shouldBeCalled();

        $em->flush()->shouldBeCalled();

        $this->onAuthenticationSuccess($event);
    }
}
