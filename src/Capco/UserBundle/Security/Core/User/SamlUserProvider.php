<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SamlUserProvider implements UserProviderInterface
{
    private UserManager $userManager;
    private string $samlIdp;

    public function __construct(UserManager $manager, string $samlIdp)
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
            // for daher, afd-interne, pole-emploi the id is the email
            $email = $id;

            // Warning: do not update "@fake-email-cap-collectif.com"
            // Because this is used to authenticate users.

            if ('oda' === $this->samlIdp) {
                $email = $id . '@fake-email-cap-collectif.com';
            }

            // If the id is not a valid email, we create a fake one...
            if (false === filter_var($email, FILTER_SANITIZE_EMAIL)) {
                $email = preg_replace('/\s+/', '', $id) . '@fake-email-cap-collectif.com';
            }

            $user->setEmail($email);
            $user->setPlainPassword(substr(str_shuffle(md5(microtime())), 0, 15));
            $user->setEnabled(true);
            $this->userManager->updateUser($user);
        }

        return $user;
    }

    public function refreshUser(UserInterface $user)
    {
        if ($user instanceof User) {
            return $this->userManager->findUserBy(['samlId' => $user->getSamlId()]);
        }
    }

    public function supportsClass($class): bool
    {
        return 'Capco\UserBundle\Entity\User' === $class;
    }
}
