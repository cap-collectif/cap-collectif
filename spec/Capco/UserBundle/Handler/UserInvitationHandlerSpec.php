<?php

namespace spec\Capco\UserBundle\Handler;

use Capco\AppBundle\Entity\Group;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Handler\UserInvitationHandler;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class UserInvitationHandlerSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        Manager $manager,
        UserInviteRepository $userInviteRepository,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        SendInBluePublisher $sendInBluePublisher
    ) {
        $this->beConstructedWith(
            $userInviteRepository,
            $organizationInvitationRepository,
            $manager,
            $em,
            $sendInBluePublisher
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserInvitationHandler::class);
    }

    public function it_should_invite_user(
        User $user,
        UserInviteRepository $userInviteRepository,
        Manager $manager,
        EntityManagerInterface $em
    ) {
        $email = 'ram@chan.com';
        $user->getEmail()->willReturn($email);

        $manager->isActive(Manager::project_admin)->willReturn(false);

        $invitation = (new UserInvite())->setEmail($email)->setIsAdmin(false);
        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $user->confirmAccount()->shouldBeCalled();

        $user->isConsentInternalCommunication()->willReturn(true);

        $this->handleUserInvite($user);
    }

    public function it_should_invite_user_as_project_admin(
        User $user,
        Manager $manager,
        UserInviteRepository $userInviteRepository,
        EntityManagerInterface $em
    ) {
        $email = 'toto@project_admin.com';
        $user->getEmail()->willReturn($email);

        $manager->isActive(Manager::project_admin)->willReturn(true);

        $invitation = (new UserInvite())
            ->setEmail($email)
            ->setIsProjectAdmin(true)
            ->setIsAdmin(false)
        ;
        $user->isConsentInternalCommunication()->willReturn(true);

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $user->addRole(UserRole::ROLE_PROJECT_ADMIN)->shouldBeCalledOnce();
        $user->addRole(UserRole::ROLE_ADMIN)->shouldNotBeCalled();

        $user->confirmAccount()->shouldBeCalled();

        $this->handleUserInvite($user);
    }

    public function it_should_invite_user_as_admin(
        User $user,
        UserInviteRepository $userInviteRepository,
        Manager $manager,
        EntityManagerInterface $em
    ) {
        $email = 'rem@chan.com';
        $user->getEmail()->willReturn($email);

        $invitation = (new UserInvite())
            ->setEmail($email)
            ->setIsProjectAdmin(false)
            ->setIsAdmin(true)
        ;

        $manager->isActive(Manager::project_admin)->willReturn(false);

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $user->addRole(UserRole::ROLE_ADMIN)->shouldBeCalledOnce();
        $user->addRole(UserRole::ROLE_PROJECT_ADMIN)->shouldNotBeCalled();

        $user->confirmAccount()->shouldBeCalled();

        $user->isConsentInternalCommunication()->willReturn(true);

        $this->handleUserInvite($user);
    }

    public function it_should_return_null_if_user_has_no_invitations(User $user)
    {
        $user->getEmail()->willReturn('abc@gmail.com');
        $this->handleUserInvite($user)->shouldReturn(null);
    }

    public function it_should_add_user_to_group(
        User $user,
        Manager $manager,
        UserInviteRepository $userInviteRepository,
        EntityManagerInterface $em,
        UserInvite $invitation,
        Group $group
    ) {
        $email = 'user-invited-in-group@gmail.com';
        $user->getEmail()->willReturn($email);

        $manager->isActive(Manager::project_admin)->willReturn(false);

        $invitation->isAdmin()->willReturn(false);
        $invitation->getEmail()->willReturn($email);
        $invitation->isProjectAdmin()->willReturn(false);

        $groups = new ArrayCollection([$group->getWrappedObject()]);
        $invitation
            ->getGroups()
            ->shouldBeCalled()
            ->willReturn($groups)
        ;

        $em->persist(Argument::type(UserGroup::class))->shouldBeCalled();

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);
        $user->confirmAccount()->shouldBeCalled();
        $user->isConsentInternalCommunication()->willReturn(true);

        $this->handleUserInvite($user);
    }
}
