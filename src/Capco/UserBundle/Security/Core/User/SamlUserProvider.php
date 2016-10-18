<?php

namespace Capco\UserBundle\Security\Core\User;

use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class SamlUserProvider implements UserProviderInterface
{
    private $userManager;

    public function __construct($manager)
    {
        $this->userManager = $manager;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['samlId' => $id]);

        if (null === $user) {
            $user = $this->userManager->createUser();
            $user->setSamlId($id);
            $user->setUsername($id);
            $user->setEmail($id.'@fake-email-cap-collectif.com');
            $user->setPlainPassword(substr(str_shuffle(md5(microtime())), 0, 15));
            $user->setEnabled(true);
        }

        $this->userManager->updateUser($user);

        return $user;
    }

    public function refreshUser(UserInterface $user)
    {
        return $this->userManager->findUserBy(['samlId' => $user->getSamlId()]);
    }

    public function supportsClass($class)
    {
        return $class === 'Capco\UserBundle\Entity\User';
    }
}
