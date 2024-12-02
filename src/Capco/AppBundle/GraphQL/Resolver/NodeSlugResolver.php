<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\SluggableInterface;
use Capco\AppBundle\Enum\SluggableEntity;
use Capco\AppBundle\Repository\GlobalDistrictRepository;
use Capco\AppBundle\Repository\Organization\OrganizationRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class NodeSlugResolver implements QueryInterface
{
    public function __construct(private readonly OrganizationRepository $organizationRepository, private readonly GlobalDistrictRepository $globalDistrictRepository)
    {
    }

    public function __invoke(Argument $argument): ?SluggableInterface
    {
        $entity = $argument->offsetGet('entity');
        $slug = $argument->offsetGet('slug');

        return match ($entity) {
            SluggableEntity::ORGANIZATION => $this->organizationRepository->findOneBySlug($slug),
            SluggableEntity::DISTRICT => $this->globalDistrictRepository->getBySlug($slug),
            default => null,
        };
    }
}
