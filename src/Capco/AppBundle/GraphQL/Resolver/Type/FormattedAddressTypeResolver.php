<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class FormattedAddressTypeResolver implements QueryInterface
{
    public function __invoke(Proposal $proposal): ?string
    {
        return $proposal->getAddress()
            ? \GuzzleHttp\json_decode($proposal->getAddress(), true)[0]['formatted_address']
            : null;
    }
}
