<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Capco\AppBundle\Repository\SluggableRepositoryInterface;
use Capco\AppBundle\Repository\SluggableStepRepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;

class NodeSlugResolver implements QueryInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {
    }

    public function __invoke(Argument $argument): ?SluggableInterface
    {
        $entity = $argument->offsetGet('entity');
        $slug = $argument->offsetGet('slug');
        $projectSlug = $argument->offsetGet('projectSlug');

        $repository = $this->em->getRepository($entity);

        $result = match (true) {
            $repository instanceof SluggableRepositoryInterface => $repository->getBySlug($slug),
            $repository instanceof SluggableStepRepositoryInterface => $repository->getBySlug($slug, $projectSlug),
            default => throw new UserError('Class not found or does not implement SluggableInterface or SluggableStepRepositoryInterface.'),
        };

        if (null === $result) {
            throw new UserError('Entity not found.');
        }

        return $result;
    }
}
