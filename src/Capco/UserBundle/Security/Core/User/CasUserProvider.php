<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * Our only CAS for now is https://capcapeb.capeb.fr/
 */
class CasUserProvider implements UserProviderInterface
{
    private UserManager $userManager;
    private GroupMutation $groupMutation;

    public function __construct(UserManager $manager, GroupMutation $groupMutation)
    {
        $this->userManager = $manager;
        $this->groupMutation = $groupMutation;
    }

    /**
     * @param string $casId
     */
    public function loadUserByUsername($casId): UserInterface
    {
        $user = $this->userManager->findUserBy(['casId' => $casId]);

        if (!$user) {
            $user = $this->userManager->createUser();
            $user->setCasId($casId);
            $user->setUsername($casId);
            
            // We create a fake email because the CAS server does not provide any data except the login
            $fakeEmail = $casId . '@fake-email-cap-collectif.com';

            $user->setEmail($fakeEmail);
            $user->setEnabled(true);
            $this->userManager->updateUser($user);
        }

        $this->groupMutation->createAndAddUserInGroup($user, 'CAS');

        return $user;
    }

    public function refreshUser(UserInterface $user): ?UserInterface
    {
        if ($user instanceof User) {
            return $this->userManager->findUserBy(['casId' => $user->getCasId()]);
        }

        return null;
    }

    /**
     * @param string $class
     */
    public function supportsClass($class): bool
    {
        return User::class === $class;
    }
}
