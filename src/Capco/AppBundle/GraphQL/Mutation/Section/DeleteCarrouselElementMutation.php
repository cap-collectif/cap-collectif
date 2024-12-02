<?php

namespace Capco\AppBundle\GraphQL\Mutation\Section;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteCarrouselElementMutation implements MutationInterface
{
    use MutationTrait;

    final public const GLOBAL_ID_NOT_EXIST = 'GLOBAL_ID_NOT_EXIST';

    public function __construct(private readonly EntityManagerInterface $entityManager, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    /**
     * @return array<string, string>
     */
    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $sectionCarrouselElementGlobalId = $args->offsetGet('id');
        $sectionCarrouselElement = $this->globalIdResolver->resolve($sectionCarrouselElementGlobalId);

        if (!$sectionCarrouselElement) {
            return ['error' => self::GLOBAL_ID_NOT_EXIST];
        }

        $this->entityManager->remove($sectionCarrouselElement);
        $this->entityManager->flush();

        return ['deletedCarrouselElementId' => $sectionCarrouselElementGlobalId];
    }
}
