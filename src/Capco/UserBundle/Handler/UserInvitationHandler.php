<?php

namespace Capco\UserBundle\Handler;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\Organization\PendingOrganizationInvitationRepository;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInvitationHandler
{
    private UserInviteRepository $userInviteRepository;
    private PendingOrganizationInvitationRepository $organizationInvitationRepository;
    private Manager $manager;
    private EntityManagerInterface $em;
    private Publisher $publisher;

    public function __construct(
        UserInviteRepository $userInviteRepository,
        PendingOrganizationInvitationRepository $organizationInvitationRepository,
        Manager $manager,
        EntityManagerInterface $em,
        Publisher $publisher
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->organizationInvitationRepository = $organizationInvitationRepository;
        $this->manager = $manager;
        $this->em = $em;
        $this->publisher = $publisher;
    }

    public function handleUserOrganizationInvite(User $user): void
    {
        if (!$user->getEmail()) {
            return;
        }
        if ($this->organizationInvitationRepository->countByEmail($user->getEmail()) < 1) {
            return;
        }

        $user->confirmAccount();
        $this->pushToSendinblue(['email' => $user->getEmail()], $user);
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
            $this->manager->isActive(Manager::unstable__project_admin)
            && $invitation->isProjectAdmin()
        ) {
            $user->addRole(UserRole::ROLE_PROJECT_ADMIN);
        }
        if ($invitation->isAdmin()) {
            $user->addRole(UserRole::ROLE_ADMIN);
        }

        $user->confirmAccount();
        $this->pushToSendinblue(['email' => $user->getEmail()], $user);
    }

    private function pushToSendinblue(array $args, User $user): void
    {
        if (!$user->isConsentInternalCommunication()) {
            return;
        }
        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => 'addEmailToSendinblue',
                    'args' => $args,
                ])
            )
        );
    }
}
