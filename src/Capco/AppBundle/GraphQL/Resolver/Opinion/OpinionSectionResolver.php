<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OpinionSectionResolver implements ResolverInterface
{
    public function __invoke(OpinionContributionInterface $proposition)
    {
        return $proposition->getOpinionType();
    }
}
