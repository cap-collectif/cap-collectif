<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationChecker;

class DeleteProjectMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationChecker $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationChecker $authorizationChecker
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('id');
        $project = $this->globalIdResolver->resolve($id, $viewer);

        $this->em->remove($project);
        $this->em->flush();

        return ['deletedProjectId' => $id];
    }

    public function isGranted(string $projectId, User $viewer): bool
    {
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if ($project) {
            return $this->authorizationChecker->isGranted(ProjectVoter::DELETE, $project);
        }

        return false;
    }
}
