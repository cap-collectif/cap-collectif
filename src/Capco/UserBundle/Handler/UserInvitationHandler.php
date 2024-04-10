<?php

namespace Capco\UserBundle\Handler;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class UserInvitationHandler
{
    private UserInviteRepository $userInviteRepository;
    private PendingOrganizationInvitationRepository $organizationInvitationRepository;
    private Manager $manager;
    private EntityManagerInterface $em;
    private SendInBluePublisher $sendInBluePublisher;

    public function __construct(
        UserInviteRepository $userInviteRepository,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        Manager $manager,
        EntityManagerInterface $em,
        SendInBluePublisher $sendInBluePublisher
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->organizationInvitationRepository = $organizationInvitationRepository;
        $this->manager = $manager;
        $this->em = $em;
        $this->sendInBluePublisher = $sendInBluePublisher;
    }

    public function handleUserOrganizationInvite(User $user): void
    {
        if (!$user->getEmail() || $this->organizationInvitationRepository->countByEmail($user->getEmail()) < 1) {
            return;
        }

        $user->confirmAccount();
        if ($user->isConsentInternalCommunication()) {
            $this->sendInBluePublisher->pushToSendinblue('addEmailToSendInBlue', ['email' => $user->getEmail()]);
        }
    }

    public function handleUserInvite(User $user): void
    {
        $email = $user->getEmail();
        if (!$email) {
            return;
        }
        $invitation = $this->userInviteRepository->findOneByEmailAndNotExpired($email);

        if (!$invitation) {
            return;
        }

        foreach ($invitation->getGroups() as $group) {
            $userGroup = (new UserGroup())->setGroup($group)->setUser($user);
            $this->em->persist($userGroup);
        }

        if (
            $this->manager->isActive(Manager::project_admin)
            && $invitation->isProjectAdmin()
        ) {
            $user->addRole(UserRole::ROLE_PROJECT_ADMIN);
        }
        if ($invitation->isAdmin()) {
            $user->addRole(UserRole::ROLE_ADMIN);
        }

        $user->confirmAccount();
        if ($user->isConsentInternalCommunication()) {
            $this->sendInBluePublisher->pushToSendinblue('addEmailToSendInBlue', ['email' => $user->getEmail()]);
        }
    }
}
