<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SourceCategory;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\SourceCategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateSourceCategoryMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly SourceCategoryRepository $repository,
        private readonly EntityManagerInterface $em
    ) {
    }

    /**
     * @return array<string, SourceCategory>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $id = $args->offsetGet('id');
        $sourceCategory = $this->repository->find($id);
        if (!$sourceCategory instanceof SourceCategory) {
            throw new UserError(sprintf('SourceCategory with id: %s not found.', $id));
        }

        if ($args->offsetExists('title') && null !== $args->offsetGet('title')) {
            $title = trim((string) $args->offsetGet('title'));
            if ('' === $title) {
                throw new UserError('Title cannot be empty.');
            }
            $sourceCategory->setTitle($title);
            $sourceCategory->mergeNewTranslations();
        }

        if ($args->offsetExists('isEnabled') && null !== $args->offsetGet('isEnabled')) {
            $sourceCategory->setIsEnabled((bool) $args->offsetGet('isEnabled'));
        }

        $this->em->flush();

        return ['sourceCategory' => $sourceCategory];
    }
}
