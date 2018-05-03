<?php

namespace spec\Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\UserIsGrantedResolver;
use Capco\UserBundle\Entity\User;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\ExpressionLanguage\Token;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorage;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class UserIsGrantedResolverSpec extends ObjectBehavior
{
    function let(User $userA, User $userB, TokenStorage $tokenStorage, LoggerInterface $logger, TokenInterface $token)
    {
        $this->beConstructedWith($tokenStorage, $logger);
    }

    function it_is_initializable()
    {
        $this->shouldHaveType(UserIsGrantedResolver::class);
    }

    function it_im_not_a_user_and_i_try_to_be_granted()
    {
        $this->isGranted('anon.')->shouldReturn(false);
    }

    function it_is_granted_as_viewer(User $userA, User $userB, TokenStorage $tokenStorage, LoggerInterface $logger, TokenInterface $token)
    {
        $userA->getRoles()->willReturn(['ROLE_USER']);
        $userB->getRoles()->willReturn(['ROLE_USER']);

        $userA->hasRole('ROLE_USER')->willReturn(true);
        $userA->hasRole('ROLE_ADMIN')->willReturn(false);
        $userB->hasRole('ROLE_ADMIN')->willReturn(false);
        $userB->hasRole('ROLE_USER')->willReturn(true);

        $userA->getId()->willReturn('1');
        $userB->getId()->willReturn('1');

        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($userB);

        $this->beConstructedWith($tokenStorage, $logger);
        $this->isGranted($userA)->shouldReturn(true);
    }

    function it_is_granted_as_admin(User $userA, User $userB, TokenStorage $tokenStorage, LoggerInterface $logger, TokenInterface $token)
    {
        $userA->getRoles()->willReturn(['ROLE_ADMIN']);
        $userB->getRoles()->willReturn(['ROLE_USER']);

        $userA->hasRole('ROLE_USER')->willReturn(false);
        $userA->hasRole('ROLE_ADMIN')->willReturn(true);
        $userB->hasRole('ROLE_ADMIN')->willReturn(false);
        $userB->hasRole('ROLE_USER')->willReturn(true);

        $userA->getId()->willReturn('1');
        $userB->getId()->willReturn('2');

        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($userB);

        $this->beConstructedWith($tokenStorage, $logger);
        $this->isGranted($userA)->shouldReturn(true);
    }

    function it_is_not_granted_as_other_user(User $userA, User $userB, TokenStorage $tokenStorage, LoggerInterface $logger, TokenInterface $token)
    {
        $userA->hasRole('ROLE_USER')->willReturn(true);
        $userA->getId()->willReturn('1');
        $userB->getId()->willReturn('2');

        $userA->hasRole('ROLE_USER')->willReturn(true);
        $userA->hasRole('ROLE_ADMIN')->willReturn(false);
        $userB->hasRole('ROLE_ADMIN')->willReturn(false);
        $userB->hasRole('ROLE_USER')->willReturn(true);

        $tokenStorage->getToken()->willReturn($token);
        $token->getUser()->willReturn($userB);
        $this->beConstructedWith($tokenStorage, $logger);
        $this->isGranted($userA)->shouldReturn(false);
    }
}
