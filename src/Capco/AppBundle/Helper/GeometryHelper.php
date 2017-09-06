<?php

namespace Capco\AppBundle\Helper;

class GeometryHelper
{
    public static function isIncluded(float $lon, float $lat, string $geojson): bool
    {
        $polygon = \geoPHP::load($geojson, 'json');
        $point = \geoPHP::load("POINT($lon $lat)", 'wkt');

        return $polygon->pointInPolygon($point);
    }
}
