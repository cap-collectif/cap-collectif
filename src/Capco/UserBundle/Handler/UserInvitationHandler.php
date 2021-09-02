<?php

namespace Capco\UserBundle\Handler;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class UserInvitationHandler
{
    private UserInviteRepository $userInviteRepository;
    private Manager $manager;
    private EntityManagerInterface $em;

    public function __construct(
        UserInviteRepository $userInviteRepository,
        Manager $manager,
        EntityManagerInterface $em
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->manager = $manager;
        $this->em = $em;
    }

    public function handleUserInvite(User $user): void
    {
        $email = $user->getEmail();

        $invitation = $this->userInviteRepository->findOneByEmailAndNotExpired($email);

        if (!$invitation) {
            return;
        }

        foreach ($invitation->getGroups() as $group) {
            $userGroup = (new UserGroup())->setGroup($group)->setUser($user);
            $this->em->persist($userGroup);
        }

        if (
            $this->manager->isActive(Manager::unstable_project_admin) &&
            $invitation->isProjectAdmin()
        ) {
            $user->addRole(UserRole::ROLE_PROJECT_ADMIN);
        }
        if ($invitation->isAdmin()) {
            $user->addRole(UserRole::ROLE_ADMIN);
        }

        $user->setConfirmationToken(null);

        $now = (new \DateTime())->format('Y-m-d');
        $user->setConfirmedAccountAt(new \DateTime($now));

        $this->em->remove($invitation);

        $this->em->flush();
    }
}
