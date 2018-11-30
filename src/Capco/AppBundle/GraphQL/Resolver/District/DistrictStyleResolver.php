<?php

namespace Capco\AppBundle\GraphQL\Resolver\District;

use Capco\AppBundle\Entity\District\AbstractDistrict;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class DistrictStyleResolver implements ResolverInterface
{
    public function __invoke(AbstractDistrict $district)
    {
        if (null === $district->getBorder() && null === $district->getBackground()) {
            return null;
        }

        return $district;
    }
}
