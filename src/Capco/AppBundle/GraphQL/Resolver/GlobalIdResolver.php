<?php
namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Model\Contribution;
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

    public function resolve(
        string $uuid,
        $user // : Node
    ) {
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
            $node = $this->container->get('capco.user.repository')->find($uuid);
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
            $node = $this->container->get('Capco\AppBundle\Repository\ProjectRepository')->find(
                $uuid
            );
        }

        if (!$node) {
            $node = $this->container->get('capco.abstract_step.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->find($uuid);
        }
        if (!$node) {
            $node = $this->container->get('capco.user.repository')->find($uuid);
        }

        if (!$node) {
            $node = $this->container->get('capco.event.repository')->find($uuid);
        }
        if (!$node) {
            $node = $this->container->get('capco.requirement.repository')->find($uuid);
        }

        if (!$node) {
            $error = 'Could not resolve node with id ' . $uuid;
            $this->container->get('logger')->warn($error);
            throw new UserError($error);
        }

        $projectContributionClass = [
            Project::class,
            Proposal::class,
            Comment::class,
            Argument::class,
            ProposalForm::class,
            AbstractStep::class,
        ];
        $this->container->get('logger')->debug(
            '-----------------------------------------------------------------------------------------'
        );
        $this->container->get('logger')->debug(get_class($node));
        $this->container->get('logger')->debug(
            '-----------------------------------------------------------------------------------------'
        );
        foreach ($projectContributionClass as $object) {
            if ($node instanceof $object) {
                if (!$node->canDisplay($user)) {
                    throw new \GraphQL\Error\UserError('Access denied');
                }
                break;
            }
        }

        return $node;
    }

    public function resolveByModerationToken(string $token): ModerableInterface
    {
        $node = $this->container->get('capco.opinion.repository')->findOneByModerationToken($token);

        if (!$node) {
            $node = $this->container->get(
                'capco.opinion_version.repository'
            )->findOneByModerationToken($token);
        }

        if (!$node) {
            $node = $this->container->get('capco.argument.repository')->findOneByModerationToken(
                $token
            );
        }

        if (!$node) {
            $this->container->get('logger')->warn(
                __METHOD__ . ' : Unknown moderation_token: ' . $token
            );
            throw new NotFoundHttpException();
        }

        return $node;
    }
}
