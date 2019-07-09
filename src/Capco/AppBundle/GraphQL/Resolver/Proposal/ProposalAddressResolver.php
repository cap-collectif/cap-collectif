<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

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
     *          types: string[]
     *      }
     *  ]
     *
     * @return array|null
     */
    public function __invoke(Proposal $proposal): ?array
    {
        if ($adressFromApi = $proposal->getAddress()) {
            $decoded = \GuzzleHttp\json_decode($adressFromApi, true);
            if (count($decoded) > 0 && $address = $decoded[0]) {
                return [
                    'raw' => $adressFromApi,
                    'formatted' => $address['formatted_address'] ?? null,
                    'types' => explode('|', $address['geometry']['location_type']),
                    'lat' => $address['geometry']['location']['lat'],
                    'lng' => $address['geometry']['location']['lng']
                ];
            }
            return null;
        }

        return null;
    }
}
