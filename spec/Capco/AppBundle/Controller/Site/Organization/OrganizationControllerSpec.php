<?php

namespace spec\Capco\AppBundle\Controller\Site\Organization;

use Capco\AppBundle\Controller\Site\Organization\OrganizationController;
use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\Entity\Organization\PendingOrganizationInvitation;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Security\LoginManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OrganizationControllerSpec extends ObjectBehavior
{
    public function let(
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        TranslatorInterface $translator,
        EntityManagerInterface $em,
        LoggerInterface $logger,
        LoginManagerInterface $loginManager
    ) {
        $this->beConstructedWith(
            $pendingOrganizationInvitationRepository,
            $translator,
            $em,
            $logger,
            $loginManager
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(OrganizationController::class);
        $this->shouldBeAnInstanceOf(AbstractController::class);
    }

    public function it_can_confirm_the_email_of_an_existing_user_to_be_a_member_of_an_organization(
        PendingOrganizationInvitationRepository $pendingOrganizationInvitationRepository,
        TranslatorInterface $translator,
        PendingOrganizationInvitation $invitation,
        User $user,
        Organization $organization,
        TokenStorageInterface $tokenStorage,
        ContainerInterface $container,
        FlashBagInterface $flashBag,
        Session $session
    ) {
        $fakeToken = 'fakeToken';
        $expectedUsername = 'toto';
        $expectedServiceSessionId = 'security.token_storage';
        $expectedTranslatorId = 'notify-success-joint-organization';
        $expectedResponse = new RedirectResponse('/admin-next/projects');

        $this->setContainer($container);

        $pendingOrganizationInvitationRepository
            ->findOneBy(['token' => $fakeToken])
            ->willReturn($invitation)
        ;

        $container
            ->has($expectedServiceSessionId)
            ->shouldBeCalledOnce()
            ->willReturn(true)
        ;

        $container
            ->get($expectedServiceSessionId)
            ->shouldBeCalledOnce()
            ->willReturn($tokenStorage)
        ;

        $invitation
            ->getUser()
            ->shouldBeCalled()
            ->willReturn($user)
        ;

        $invitation
            ->getOrganization()
            ->shouldBeCalled()
            ->willReturn($organization)
        ;

        $organization
            ->addMember(Argument::any())
            ->shouldBeCalledOnce()
            ->willReturn($organization)
        ;

        $user
            ->addMemberOfOrganization(Argument::any())
            ->shouldBeCalledOnce()
            ->willReturn($user)
        ;

        $user
            ->getUsername()
            ->shouldBeCalledOnce()
            ->willReturn($expectedUsername)
        ;

        $invitation
            ->getRole()
            ->shouldBeCalledOnce()
            ->willReturn('ROLE_USER')
        ;

        $organization
            ->getUsername()
            ->shouldBeCalledOnce()
            ->willReturn($expectedUsername)
        ;

        $translator
            ->trans($expectedTranslatorId, ['organizationName' => 'Super Orga'], 'CapcoAppBundle')
            ->shouldBeCalledOnce()
            ->willReturn($expectedTranslatorId)
        ;

        $container
            ->has('session')
            ->willReturn(true)
        ;

        $container
            ->get('session')
            ->willReturn($session)
        ;

        $session
            ->getFlashBag()
            ->willReturn($flashBag)
        ;

        $flashBag
            ->add('success', $expectedTranslatorId)
            ->shouldBeCalledOnce()
        ;

        $organization
            ->getTitle()
            ->willReturn('Super Orga')
        ;

        $response = $this->acceptInvitation($fakeToken);

        $response->shouldHaveType(RedirectResponse::class);
        $response->getTargetUrl()->shouldBeEqualTo($expectedResponse->getTargetUrl());
    }
}
