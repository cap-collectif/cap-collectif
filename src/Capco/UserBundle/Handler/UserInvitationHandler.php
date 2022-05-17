<?php

namespace Capco\UserBundle\Handler;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInvitationHandler
{
    private UserInviteRepository $userInviteRepository;
    private Manager $manager;
    private EntityManagerInterface $em;
    private Publisher $publisher;

    public function __construct(
        UserInviteRepository $userInviteRepository,
        Manager $manager,
        EntityManagerInterface $em,
        Publisher $publisher
    ) {
        $this->userInviteRepository = $userInviteRepository;
        $this->manager = $manager;
        $this->em = $em;
        $this->publisher = $publisher;
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
            $this->manager->isActive(Manager::unstable__project_admin) &&
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

        if ($user->isConsentInternalCommunication()) {
            $this->pushToSendinblue(['email' => $user->getEmail()]);
        }

        $this->em->persist($user);
        $this->em->flush();
    }

    private function pushToSendinblue(array $args): void
    {
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
