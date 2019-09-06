<?php

namespace spec\Capco\AppBundle\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\AppBundle\EventListener\AuthenticationListener;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Component\HttpFoundation\HeaderBag;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Event\AuthenticationFailureEvent;
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
            ->willReturn('{"username": "lbrunet@jolicode.com"}');
        $request
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');
        $request->headers = $headerBag;

        $expectedUserConnection = new UserConnection();
        $expectedUserConnection->setDatetime(new \DateTime());
        $expectedUserConnection->setSuccess(false);
        $expectedUserConnection->setEmail('lbrunet@jolicode.com');
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
        TokenInterface $tokenInterface,
        User $user
    ) {
        $headerBag = new HeaderBag(['user-agent' => 'TEST']);
        $event
            ->getRequest()
            ->shouldBeCalled()
            ->willReturn($request);

        $event
            ->getAuthenticationToken()
            ->shouldBeCalled()
            ->willReturn($tokenInterface);
        $tokenInterface
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user);
        $request
            ->getContent()
            ->shouldBeCalled()
            ->willReturn('{"username": "lbrunet@jolicode.com"}');
        $request
            ->getClientIp()
            ->shouldBeCalled()
            ->willReturn('192.168.64.2');
        $request->headers = $headerBag;

        $expectedUserConnection = new UserConnection();
        $expectedUserConnection->setDatetime(new \DateTime());
        $expectedUserConnection->setSuccess(true);
        $expectedUserConnection->setEmail('lbrunet@jolicode.com');
        $expectedUserConnection->setNavigator('TEST');
        $expectedUserConnection->setIpAddress('192.168.64.2');

        $this->onAuthenticationSuccess($event);
        $entityManager
            ->persist(
                Argument::that(function ($userConnection) use (
                    $expectedUserConnection) : bool {
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
