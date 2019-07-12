<?php
namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Exception\ParisAuthenticationException;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class MonCompteParisUserProvider implements UserProviderInterface
{
    private $userManager;
    private $openAmCaller;

    public function __construct(UserManager $manager, OpenAmClient $openAmCaller)
    {
        $this->userManager = $manager;
        $this->openAmCaller = $openAmCaller;
    }

    public function loadUserByUsername($id)
    {
        $user = $this->userManager->findUserBy(['parisId' => $id]);
        if (null === $user) {
            $informations = $this->openAmCaller->getUserInformations($id);
            if (false === filter_var($informations['validatedAccount'], FILTER_VALIDATE_BOOLEAN)) {
                throw new ParisAuthenticationException(
                    $id,
                    'Please validate your account from Mon Compte Paris'
                );
            }

            $user = $this->userManager->createUser();
            $user->setParisId($id);
            // We don't have a username from informations
            // It will be asked later to the user
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

        return null;
    }

    public function supportsClass($class): bool
    {
        return User::class === $class;
    }
}
