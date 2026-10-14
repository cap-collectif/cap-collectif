<?php

namespace Capco\AppBundle\GraphQL\Resolver\VocalContribution;

use Capco\AppBundle\Entity\VocalContribution;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class VocalContributionMediaIdResolver implements QueryInterface
{
    public function __invoke(VocalContribution $vocalContribution): string
    {
        return GlobalId::toGlobalId('Media', $vocalContribution->getMedia()->getId());
    }
}
