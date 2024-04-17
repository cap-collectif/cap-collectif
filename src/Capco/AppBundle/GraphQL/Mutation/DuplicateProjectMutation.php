<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\AppBundle\Service\CloneStepService;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DuplicateProjectMutation implements MutationInterface
{
    use MutationTrait;

    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;
    private CloneStepService $cloneStepService;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        CloneStepService $cloneStepService
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->cloneStepService = $cloneStepService;
    }

    public function __invoke(Argument $input, User $viewer)
    {
        $this->formatInput($input);
        $projectId = $input->offsetGet('id');
        $originalProject = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$originalProject instanceof Project) {
            throw new UserError('This project does not exist.');
        }

        $clonedProject = $this->cloneStepService->cloneProject($originalProject);

        return ['oldProject' => $originalProject, 'newProject' => $clonedProject];
    }

    public function isGranted(string $projectId, User $viewer): bool
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        return $this->authorizationChecker->isGranted(ProjectVoter::DUPLICATE, $project);
    }
}
