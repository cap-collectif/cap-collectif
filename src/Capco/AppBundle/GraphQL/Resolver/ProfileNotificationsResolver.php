<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProfileNotificationsResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve(Arg $args): UserNotificationsConfiguration
    {
        return $this->container->get('capco.user.repository')->find($args['userId'])->getNotificationsConfiguration();
    }
}
