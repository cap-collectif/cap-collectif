<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Model\ModerableInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class GlobalIdResolver
{
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function resolveMultiple(array $array, $user): array
    {
        $results = [];
        foreach ($array as $value) {
            $results[] = $this->resolve($value, $user);
        }

        return $results;
    }

    public function resolve(string $uuid, $user)// : Node
    {
        $em = $this->container->get('doctrine.orm.default_entity_manager');
        if ($user instanceof User && $user->isAdmin()) {
            // If user is an admin, we allow to retrieve softdeleted nodes
            if ($em->getFilters()->isEnabled('softdeleted')) {
                $em->getFilters()->disable('softdeleted');
            }
        }

        $node = null;
        $node = $this->container->get('capco.opinion.repository')->find($uuid);

        if (!$node) {
            $node = $this->container->get('capco.opinion_version.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.questionnaire.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.opinion_type.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.group.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.proposal.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.proposal_form.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.comment.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.project.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.abstract_step.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.event.repository')->find($uuid);
        }

        if (!$node) {
            $this->container->get('logger')->warn('Unknown id: ' . $uuid);
            throw new UserError('Not found');
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
