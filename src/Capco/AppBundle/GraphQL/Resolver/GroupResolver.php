<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Group;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class GroupResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve(string $groupId): Group
    {
        return $this->container->get('capco.group.repository')->find($groupId);
    }
}
