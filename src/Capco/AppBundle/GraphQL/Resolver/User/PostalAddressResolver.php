<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class PostalAddressResolver implements ResolverInterface
{
    /**
     * $adressFromApi is a A JSON string litteral that is currently returned by Google Maps Address API and looks like this
     *  [
     *      {
     *          adress_components: not relevant
     *          formatted_address: string
     *              geometry: { location: { lat: float, lng: float }, location_type: string, viewport: not revelant }
     *          place_id: string
     *          types: string, separated by a |
     *      }
     *  ].
     */
    public function __invoke(User $user): ?GoogleMapsAddress
    {
        if ($addressFromApi = $user->getPostalAddress()) {
            return GoogleMapsAddress::fromApi($addressFromApi);
        }

        return null;
    }
}
