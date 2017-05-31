<?php

namespace Capco\UserBundle\Security\Core\User;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SamlUserProvider implements UserProviderInterface
{
    private $userManager;
    private $samlIdp;

    public function __construct($manager, $samlIdp)
    {
        $this->userManager = $manager;
        $this->samlIdp = $samlIdp;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['samlId' => $id]);

        if (null === $user) {
            $user = $this->userManager->createUser();
            $user->setSamlId($id);
            $user->setUsername($id);

            if ($this->samlIdp === 'oda') {
                $user->setEmail($id . '@fake-email-cap-collectif.com');
            }
            if ($this->samlIdp === 'daher') {
                $user->setEmail($id);
            }

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
