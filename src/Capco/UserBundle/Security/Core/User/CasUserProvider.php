<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * Class CasUserProvider.
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

        if (null !== $user) {
            $user->setCasId($casId);
            $user->setUsername($casId);
        } else {
            $user = $this->userManager->createUser();
            $user->setCasId($casId);
            $user->setUsername($casId);
            // create fake email, the CAS server does not provide any data except the login
            $email = $casId . '@fake-email-cap-collectif.com';

            $user->setEmail($email);
            $user->setEnabled(true);
        }
        $this->userManager->updateUser($user);

        $this->groupMutation->createAndAddUserInGroup($user, 'CAS');

        return $user;
    }

    /**
     * @return UserInterface
     */
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
