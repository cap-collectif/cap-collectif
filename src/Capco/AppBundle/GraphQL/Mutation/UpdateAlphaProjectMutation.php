<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Form\Persister\ProjectPersister;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UpdateAlphaProjectMutation implements MutationInterface
{
    private ProjectPersister $persister;
    private ProjectRepository $projectRepository;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        ProjectPersister $persister,
        ProjectRepository $projectRepository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->persister = $persister;
        $this->projectRepository = $projectRepository;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $project = $this->persister->persist($input, $viewer, true);

        return ['project' => $project];
    }

    public function isGranted(string $projectId): bool
    {
        $project = $this->projectRepository->find(GlobalId::fromGlobalId($projectId)['id']);

        if ($project) {
            return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
        }

        return false;
    }
}
