<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Exception\ParisAuthenticationException;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Service\CasUserFilter;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Exception\CasAuthenticationException;

/**
 * Our only CAS for now is https://capcapeb.capeb.fr/
 */
class CasUserProvider implements UserProviderInterface
{
    private UserManager $userManager;
    private GroupMutation $groupMutation;

    private CasUserFilter $casUserFilter;

    private LoggerInterface $logger;


    public function __construct(
        UserManager $manager,
        GroupMutation $groupMutation,
        CasUserFilter $casUserFilter,
        LoggerInterface $logger
    )
    {
        $this->userManager = $manager;
        $this->groupMutation = $groupMutation;
        $this->casUserFilter = $casUserFilter;
        $this->logger = $logger;
    }

    /**
     * @param string $casId
     */
    public function loadUserByUsername($casId): UserInterface
    {
        if('capcapeb' === getenv('SYMFONY_INSTANCE_NAME') && $this->casUserFilter->isNotAuthorizedCasUserProfile($casId)) {

            $this->logger->error('Access denied for '.$casId. ' as invalidate cas user');
            throw new CasAuthenticationException (
                'Vous n\'êtes pas autorisé à accéder à cet espace, désolé. Pour toute question, contactez votre administrateur réseau'
            );
        }
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
