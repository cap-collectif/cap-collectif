<?php

namespace Capco\UserBundle\Security\Core\User;

use FOS\UserBundle\Util\Canonicalizer;
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

            if ('oda' === $this->samlIdp) {
                $user->setEmail($id . '@fake-email-cap-collectif.com');
                $this->setEmailCanonical((new Canonicalizer())->canonicalize($id . '@fake-email-cap-collectif.com'));
            }
            if ('daher' === $this->samlIdp || 'afd-interne' === $this->samlIdp || 'pole-emploi' === $this->samlIdp) {
                $user->setEmail($id);
                $this->setEmailCanonical((new Canonicalizer())->canonicalize($id));
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

    public function supportsClass($class): bool
    {
        return 'Capco\UserBundle\Entity\User' === $class;
    }
}
