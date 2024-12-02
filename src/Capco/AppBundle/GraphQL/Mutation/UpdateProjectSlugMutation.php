<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class UpdateProjectSlugMutation implements MutationInterface
{
    use MutationTrait;

    final public const PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND';

    public function __construct(private readonly EntityManagerInterface $em, private readonly GlobalIdResolver $globalIdResolver, private readonly SluggerInterface $slugger, private readonly AuthorizationCheckerInterface $authorizationChecker)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $projectId = $input->offsetGet('projectId');

        /** * @var Project $project */
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$project) {
            return ['errorCode' => self::PROJECT_NOT_FOUND, 'project' => null];
        }

        $slug = $this->slugger->slug($input->offsetGet('slug'))->toString();

        $project->setSlug($slug);
        $this->em->flush();

        return ['project' => $project, 'errorCode' => null];
    }

    public function isGranted(string $projectId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if ($project) {
            return $this->authorizationChecker->isGranted(ProjectVoter::EDIT, $project);
        }

        return false;
    }
}
