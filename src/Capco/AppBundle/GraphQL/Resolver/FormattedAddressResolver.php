<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Proposal;

class FormattedAddressResolver
{
    public function __invoke(Proposal $proposal)
    {
        return $proposal->getAddress() ? json_decode($proposal->getAddress(), true)[0]['formatted_address'] : '';
    }
}
