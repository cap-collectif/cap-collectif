<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class OpinionSectionResolver implements QueryInterface
{
    public function __invoke(OpinionContributionInterface $proposition)
    {
        return $proposition->getOpinionType();
    }
}
