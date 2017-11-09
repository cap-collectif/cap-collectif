<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\UserBundle\Entity\User;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserNotificationsConfigurationResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve(User $user): UserNotificationsConfiguration
    {
        return $user->getNotificationsConfiguration();
    }
}
