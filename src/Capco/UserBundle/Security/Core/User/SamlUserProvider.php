<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class SamlUserProvider implements UserProviderInterface
{
    private UserManager $userManager;
    private string $samlIdp;
    private GroupMutation $groupMutation;

    public function __construct(UserManager $manager, string $samlIdp, GroupMutation $groupMutation)
    {
        $this->samlIdp = $samlIdp;
        $this->userManager = $manager;
        $this->groupMutation = $groupMutation;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['samlId' => $id]);

        if (null === $user) {
            $user = $this->userManager->findUserByEmail($id);

            if (null !== $user) {
                $user->setSamlId($id);
                $this->userManager->updateUser($user);
            } else {
                $user = $this->userManager->createUser();
                $user->setSamlId($id);
                $user->setUsername($id);
                $email = $id;

                // If the id is not a valid email, we create a fake one...
                if (false === filter_var($email, \FILTER_SANITIZE_EMAIL)) {
                    $email = preg_replace('/\s+/', '', $id) . '@fake-email-cap-collectif.com';
                }

                $user->setEmail($email);
                $user->setPlainPassword(substr(str_shuffle(md5(microtime())), 0, 15));
                $user->setEnabled(true);
                $this->userManager->updateUser($user);
            }
        }

        $this->groupMutation->createAndAddUserInGroup($user, 'SAML');

        return $user;
    }

    public function refreshUser(UserInterface $user)
    {
        if ($user instanceof User) {
            return $this->userManager->findUserBy(['samlId' => $user->getSamlId()]);
        }

        return null;
    }

    public function supportsClass($class): bool
    {
        return 'Capco\UserBundle\Entity\User' === $class;
    }
}
