<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Form\Persister\ProjectTab\CreateProjectTabPersister;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractCreateProjectTabMutation extends AbstractProjectTabMutation implements MutationInterface
{
    public function __construct(
        private readonly CreateProjectTabPersister $createProjectTabPersister,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($em, $globalIdResolver, $authorizationChecker);
    }

    /**
     * @return array<string, mixed>
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->normalizeInput($input);

        return $this->createProjectTabPersister->persist($this->getProjectTabClass(), $input, $viewer);
    }

    public function isGranted(string $projectId, ?User $viewer = null): bool
    {
        return $this->canEditProject($this->getProject($projectId, $viewer));
    }

    abstract protected function getProjectTabClass(): string;
}
