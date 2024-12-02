<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Utils\Map;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryGeocodeResolver implements QueryInterface
{
    public function __construct(private readonly Map $map)
    {
    }

    public function __invoke(float $latitude, float $longitude): ?GoogleMapsAddress
    {
        try {
            $json = $this->map->reverserGeocodingAddress($latitude, $longitude);
            if ($json) {
                return GoogleMapsAddress::fromApi($json);
            }
        } catch (\Exception) {
            return null;
        }

        return null;
    }
}
