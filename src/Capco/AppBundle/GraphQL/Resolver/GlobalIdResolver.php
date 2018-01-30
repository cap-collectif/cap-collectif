<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Model\ModerableInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GlobalIdResolver
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function resolve(string $uuid)// : Node
    {
        $node = null;
        $node = $this->container->get('capco.opinion.repository')->find($uuid);

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->find($uuid);
        }

        if (!$node) {
            throw new AccessDeniedException('Not found');
        }

        return $node;
    }

    public function resolveByModerationToken(string $token): ModerableInterface
    {
        $node = $this->container->get('capco.opinion.repository')->findOneByModerationToken($token);

        if (!$node) {
            $node = $this->container->get('capco.opinion_version.repository')->findOneByModerationToken($token);
        }

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->findOneByModerationToken($token);
        }

        if (!$node) {
            $this->container->get('logger')->warn('Unknown moderation_token: ' . $token);
            throw new NotFoundHttpException();
        }

        return $node;
    }
}
