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
    private readonly OrganizationRepository $organizationRepository;
    private readonly GlobalDistrictRepository $globalDistrictRepository;

    public function __construct(
        OrganizationRepository $organizationRepository,
        GlobalDistrictRepository $globalDistrictRepository
    ) {
        $this->organizationRepository = $organizationRepository;
        $this->globalDistrictRepository = $globalDistrictRepository;
    }

    public function __invoke(Argument $argument): ?SluggableInterface
    {
        $entity = $argument->offsetGet('entity');
        $slug = $argument->offsetGet('slug');

        switch ($entity) {
            case SluggableEntity::ORGANIZATION :
                // ici c'est un cas un peu spécial vu qu'il y a des traductions donc on fait appel à une method custom
                // mais en général tu peux faire appel à ->findOneBy(['slug' => $slug])
                return $this->organizationRepository->findOneBySlug($slug);

            case SluggableEntity::DISTRICT :
                return $this->globalDistrictRepository->getBySlug($slug);

            default:
                return null;
        }
    }
}
