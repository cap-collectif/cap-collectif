<?php

namespace spec\Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Controller\Site\UserController;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserControllerSpec extends ObjectBehavior
{
    public function let(
        UserInviteRepository $userInviteRepository,
        UserRepository $userRepository,
        AbstractSSOConfigurationRepository $ssoConfigurationRepository,
        EntityManagerInterface $em,
        Manager $toggleManager,
        RouterInterface $router,
        LoggerInterface $logger,
        TranslatorInterface $translator
    ) {
        $this->beConstructedWith(
            $userInviteRepository,
            $userRepository,
            $ssoConfigurationRepository,
            $em,
            $toggleManager,
            $router,
            $logger,
            $translator
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UserController::class);
        $this->shouldBeAnInstanceOf(AbstractController::class);
    }

    public function it_can_confirm_the_email_of_an_anonymous_user_to_become_a_member_of_an_organization_after_registration(
        Request $request,
        UserInviteRepository $userInviteRepository,
        UserInvite $userInvite,
        UserRepository $userRepository,
        User $user,
        Organization $organization
    ) {
        $fakeEmail = 'toto@gmail.com';
        $expectedResponse = new RedirectResponse('/admin-next/projects');

        $request
            ->get('token')
            ->willReturn('fakeToken')
        ;

        $userInvite
            ->getEmail()
            ->willReturn($fakeEmail)
        ;

        $userInvite
            ->getRedirectionUrl()
            ->willReturn(null)
        ;

        $userRepository
            ->findOneByEmail($fakeEmail)
            ->willReturn($user)
        ;

        $userInviteRepository
            ->findOneByToken('fakeToken')
            ->willReturn($userInvite)
        ;

        $userInvite
            ->getOrganization()
            ->willReturn($organization)
        ;

        $invitation = $this->invitation($request);
        $invitation->getTargetUrl()->shouldBeEqualTo($expectedResponse->getTargetUrl());
    }
}
