<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class MonCompteParisUserProvider implements UserProviderInterface
{
    private $userManager;
    private $openAmCaller;

    public function __construct($manager, OpenAmClient $openAmCaller)
    {
        $this->userManager = $manager;
        $this->openAmCaller = $openAmCaller;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['parisId' => $id]);

        if (null === $user) {
            $user = $this->userManager->createUser();
            $user->setParisId($id);
            $user->setUsername(null);
            $user->setEmail($id);
            $user->setPlainPassword('No password is stored locally.');
            $user->setEnabled(true);
            $this->userManager->updateUser($user);
        }

        return $user;
    }

    public function refreshUser(UserInterface $user)
    {
        if ($user instanceof User) {
            return $this->userManager->findUserBy(['parisId' => $user->getParisId()]);
        }
    }

    public function supportsClass($class): bool
    {
        return 'Capco\UserBundle\Entity\User' === $class;
    }
}
