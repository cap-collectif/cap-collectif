<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SourceCategory;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SourceCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class DeleteSourceCategoryMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly SourceCategoryRepository $repository,
        private readonly EntityManagerInterface $em
    ) {
    }

    /**
     * @return array<string, string>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $id = $args->offsetGet('id');
        $sourceCategory = $this->repository->find($id);
        if (!$sourceCategory instanceof SourceCategory) {
            throw new UserError(sprintf('SourceCategory with id: %s not found.', $id));
        }

        $this->em->remove($sourceCategory);
        $this->em->flush();

        return ['deletedSourceCategoryId' => $id];
    }
}
