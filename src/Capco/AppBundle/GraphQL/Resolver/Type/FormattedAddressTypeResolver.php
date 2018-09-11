<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class FormattedAddressTypeResolver implements ResolverInterface
{
    public function __invoke(Proposal $proposal): ?string
    {
        return $proposal->getAddress()
            ? \GuzzleHttp\json_decode($proposal->getAddress(), true)[0]['formatted_address']
            : null;
    }
}
