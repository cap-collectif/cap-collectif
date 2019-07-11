<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalAddressResolver implements ResolverInterface
{
    /**
     * @param Proposal $proposal
     *
     * $adressFromApi is a A JSON string litteral that is currently returned by Google Maps Address API and looks like this
     *  [
     *      {
     *          adress_components: not relevant
     *          formatted_address: string
 *              geometry: { location: { lat: float, lng: float }, location_type: string, viewport: not revelant }
     *          place_id: string
     *          types: string, separated by a |
     *      }
     *  ]
     *
     * @return array|null
     */
    public function __invoke(Proposal $proposal): ?GoogleMapsAddress
    {
        if ($addressFromApi = $proposal->getAddress()) {
            return GoogleMapsAddress::fromApi($addressFromApi);
        }

        return null;
    }
}
