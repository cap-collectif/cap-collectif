<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\UserBundle\Entity\User;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class UserNotificationsConfigurationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve($user): UserNotificationsConfiguration
    {
        if (!$user instanceof User) {
            throw new AccessDeniedException('You must be logged');
        }

        return $user->getNotificationsConfiguration();
    }
}
