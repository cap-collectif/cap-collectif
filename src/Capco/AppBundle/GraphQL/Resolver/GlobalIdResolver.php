<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Model\TrashableInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class GlobalIdResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolve(string $uuid)
    {
        $node = null;

        $node = $this->container->get('capco.opinion.repository')->find($uuid);

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->find($uuid);
        }
        // $this->container->get('capco.group.repository')->find($groupId);

        if (!$node) {
            throw new AccessDeniedException('Not found');
        }

        return $node;
    }

    public function resolveByModerationToken(string $token): TrashableInterface
    {
        $node = $this->container->get('capco.opinion.repository')->findByModerationToken($token);

        if (!$node) {
            $node = $this->container->get('capco.opinion_version.repository')->findByModerationToken($token);
        }

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->findByModerationToken($token);
        }

        return $node;
    }
}
