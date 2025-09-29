<?php

namespace Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Exception\CasAuthenticationException;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Security\Service\CapebUserFilter;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

/**
 * Our only CAS for now is CAPEB.
 */
class CasUserProvider implements UserProviderInterface
{
    public function __construct(
        private readonly UserManager $userManager,
        private readonly GroupMutation $groupMutation,
        private readonly CapebUserFilter $capebUserFilter,
        private readonly LoggerInterface $logger
    ) {
    }

    /**
     * @param string $casId
     */
    public function loadUserByUsername($casId): UserInterface
    {
        $user = $this->userManager->findUserBy(['casId' => $casId]);

        if (!$user) {
            $user = $this->userManager->createUser();
            $user->setCasId($casId);
            $user->setUsername($casId);

            // capcapeb custom code
            if ('capcapeb' === getenv('SYMFONY_INSTANCE_NAME')) {
                $userType = $this->capebUserFilter->getUserType($casId);

                if (null === $userType) {
                    $this->logger->error('Access denied for ' . $casId . ' as invalidate cas user');

                    throw new CasAuthenticationException('Vous n\'êtes pas autorisé à accéder à cet espace, désolé. Pour toute question, contactez votre administrateur réseau');
                }

                $user->setUserType($userType);
            }

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
