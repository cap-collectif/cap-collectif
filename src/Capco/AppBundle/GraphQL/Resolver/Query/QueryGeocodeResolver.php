<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\DTO\GoogleMapsAddress;
use Capco\AppBundle\Utils\Map;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryGeocodeResolver implements QueryInterface
{
    private readonly Map $map;

    public function __construct(Map $map)
    {
        $this->map = $map;
    }

    public function __invoke(float $latitude, float $longitude): ?GoogleMapsAddress
    {
        try {
            $json = $this->map->reverserGeocodingAddress($latitude, $longitude);
            if ($json) {
                return GoogleMapsAddress::fromApi($json);
            }
        } catch (\Exception $exception) {
            return null;
        }

        return null;
    }
}
