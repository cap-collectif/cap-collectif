<?php

namespace Capco\UserBundle\Security\Core\User;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class MonCompteParisUserProvider implements UserProviderInterface
{
    private $userManager;

    public function __construct($manager)
    {
        $this->userManager = $manager;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['parisId' => $id]);

        if (null === $user) {
            // Call Paris API ?
            $user = $this->userManager->createUser();
            $user->setParisId($id);
            $user->setUsername($id);
            $user->setEmail('trololo@paris.fr');
            $user->setPlainPassword(substr(str_shuffle(md5(microtime())), 0, 15));
            $user->setEnabled(true);
            $this->userManager->updateUser($user);
        }

        return $user;
    }

    public function refreshUser(UserInterface $user)
    {
        return $this->userManager->findUserBy(['samlId' => $user->getParisId()]);
    }

    public function supportsClass($class): bool
    {
        return 'Capco\UserBundle\Entity\User' === $class;
    }
}
