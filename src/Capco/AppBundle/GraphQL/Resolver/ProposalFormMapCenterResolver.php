<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormMapCenterResolver implements ResolverInterface
{
    public function __invoke($entity): ?GoogleMapsAddress
    {
        if ($entity->getMapCenter()) {
            return GoogleMapsAddress::fromApi($entity->getMapCenter());
        }

        return null;
    }
}
