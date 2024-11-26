<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteProjectMutation implements MutationInterface
{
    use MutationTrait;
    private readonly EntityManagerInterface $em;
    private readonly GlobalIdResolver $globalIdResolver;
    private readonly AuthorizationCheckerInterface $authorizationChecker;
    private readonly Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->indexer = $indexer;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $id = $input->offsetGet('id');
        $project = $this->globalIdResolver->resolve($id, $viewer);

        $this->indexer->remove(
            ClassUtils::getClass($project),
            $project->getId()
        );
        $this->indexer->finishBulk();

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
