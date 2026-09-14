<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\SourceCategory;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CreateSourceCategoryMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /**
     * @return array<string, SourceCategory>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $title = trim((string) $args->offsetGet('title'));
        if ('' === $title) {
            throw new UserError('Title cannot be empty.');
        }

        $sourceCategory = new SourceCategory();
        $sourceCategory->setTitle($title);
        $sourceCategory->mergeNewTranslations();

        $this->em->persist($sourceCategory);
        $this->em->flush();

        return ['sourceCategory' => $sourceCategory];
    }
}
