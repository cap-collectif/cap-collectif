<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class UpdateProjectSlugMutation implements MutationInterface
{
    public const PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private SluggerInterface $slugger;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        SluggerInterface $slugger
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->slugger = $slugger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $projectId = $input->offsetGet('projectId');

        /** * @var $project Project */
        $project = $this->globalIdResolver->resolve($projectId, $viewer);

        if (!$project) {
            return ['errorCode' => self::PROJECT_NOT_FOUND, 'project' => null];
        }

        $slug = $this->slugger->slug($input->offsetGet('slug'))->toString();

        $project->setSlug($slug);
        $this->em->flush();

        return ['project' => $project, 'errorCode' => null];
    }
}
