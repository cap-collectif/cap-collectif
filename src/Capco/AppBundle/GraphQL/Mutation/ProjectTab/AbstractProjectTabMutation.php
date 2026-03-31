<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\ProjectTab;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractProjectTabMutation
{
    use MutationTrait;

    public function __construct(
        protected readonly EntityManagerInterface $em,
        protected readonly GlobalIdResolver $globalIdResolver,
        protected readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    protected function getProject(string $projectId, ?User $viewer = null): ?Project
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        return $project instanceof Project ? $project : null;
    }

    protected function getProjectTab(string $tabId, ?User $viewer = null): ?ProjectTab
    {
        $decodedId = GlobalIdResolver::getDecodedId($tabId, true);
        $tab = \is_string($decodedId) ? $this->em->getRepository(ProjectTab::class)->find($decodedId) : null;

        return $tab instanceof ProjectTab ? $tab : null;
    }

    protected function canEditProject(?Project $project): bool
    {
        return null !== $project && $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
    }

    protected function normalizeInput(Argument $input): void
    {
        $this->formatInput($input);
    }
}
