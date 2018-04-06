<?php

namespace Capco\AppBundle\GraphQL\Resolver\Type;

use Capco\AppBundle\Entity\Proposal;

class FormattedAddressTypeResolver
{
    public function __invoke(Proposal $proposal): ?string
    {
        return $proposal->getAddress() ? \GuzzleHttp\json_decode($proposal->getAddress(), true)[0]['formatted_address'] : null;
    }
}
