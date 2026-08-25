<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ProjectType;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\ProjectTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateProjectTypeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly ProjectTypeRepository $repository,
        private readonly EntityManagerInterface $em
    ) {
    }

    /**
     * @return array<string, ProjectType>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $id = $args->offsetGet('id');
        $projectType = $this->repository->find($id);
        if (!$projectType instanceof ProjectType) {
            throw new UserError(sprintf('ProjectType with id: %s not found.', $id));
        }

        $projectType->setColor($args->offsetGet('color'));
        $this->em->flush();

        $cacheDriver = $this->em->getConfiguration()->getResultCacheImpl();
        $cacheDriver->delete(ProjectTypeRepository::findAllCacheKey());

        return ['projectType' => $projectType];
    }
}
