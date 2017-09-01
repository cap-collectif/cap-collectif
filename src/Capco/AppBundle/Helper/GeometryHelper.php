<?php

namespace Capco\AppBundle\Helper;

// include_once('../../../vendor/phayes/geophp/geoPHP.inc');

class GeometryHelper
{
    public static function isIncluded($lon, $lat, string $geojson): bool
    {
        $polygon = \geoPHP::load($geojson, 'json');
        $point = \geoPHP::load("POINT($lon $lat)", 'wkt');

        return $polygon->pointInPolygon($point);
    }
}
