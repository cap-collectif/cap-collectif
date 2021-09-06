<?php

namespace spec\Capco\UserBundle\Handler;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Entity\Group;
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
        UserInviteRepository $userInviteRepository
    ) {
        $this->beConstructedWith($userInviteRepository, $manager, $em);
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

        $manager->isActive(Manager::unstable_project_admin)->willReturn(false);

        $invitation = (new UserInvite())->setEmail($email)->setIsAdmin(false);
        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $now = (new \DateTime())->format('Y-m-d');
        $date = new \DateTime($now);
        $user->setConfirmationToken(null)->shouldBeCalledOnce();
        $user->setConfirmedAccountAt($date)->shouldBeCalledOnce();

        $em->persist($user)->shouldBeCalledOnce();
        $em->remove($invitation)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

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

        $manager->isActive(Manager::unstable_project_admin)->willReturn(true);

        $invitation = (new UserInvite())
            ->setEmail($email)
            ->setIsProjectAdmin(true)
            ->setIsAdmin(false);

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $user->addRole(UserRole::ROLE_PROJECT_ADMIN)->shouldBeCalledOnce();
        $user->addRole(UserRole::ROLE_ADMIN)->shouldNotBeCalled();

        $now = (new \DateTime())->format('Y-m-d');
        $date = new \DateTime($now);
        $user->setConfirmationToken(null)->shouldBeCalledOnce();
        $user->setConfirmedAccountAt($date)->shouldBeCalledOnce();

        $em->persist($user)->shouldBeCalledOnce();
        $em->remove($invitation)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

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
            ->setIsAdmin(true);

        $manager->isActive(Manager::unstable_project_admin)->willReturn(false);

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $user->addRole(UserRole::ROLE_ADMIN)->shouldBeCalledOnce();
        $user->addRole(UserRole::ROLE_PROJECT_ADMIN)->shouldNotBeCalled();

        $now = (new \DateTime())->format('Y-m-d');
        $date = new \DateTime($now);
        $user->setConfirmationToken(null)->shouldBeCalledOnce();
        $user->setConfirmedAccountAt($date)->shouldBeCalledOnce();

        $em->persist($user)->shouldBeCalledOnce();
        $em->remove($invitation)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

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

        $manager->isActive(Manager::unstable_project_admin)->willReturn(false);

        $invitation->isAdmin()->willReturn(false);
        $invitation->getEmail()->willReturn($email);
        $invitation->isProjectAdmin()->willReturn(false);

        $groups = new ArrayCollection([$group->getWrappedObject()]);
        $invitation
            ->getGroups()
            ->shouldBeCalled()
            ->willReturn($groups);

        $em->persist(Argument::type(UserGroup::class))->shouldBeCalled();

        $userInviteRepository->findOneByEmailAndNotExpired($email)->willReturn($invitation);

        $now = (new \DateTime())->format('Y-m-d');
        $date = new \DateTime($now);
        $user->setConfirmationToken(null)->shouldBeCalledOnce();
        $user->setConfirmedAccountAt($date)->shouldBeCalledOnce();

        $em->persist($user)->shouldBeCalledOnce();
        $em->remove($invitation)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $this->handleUserInvite($user);
    }
}
