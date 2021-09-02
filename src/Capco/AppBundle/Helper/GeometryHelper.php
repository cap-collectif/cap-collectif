<?php

namespace Capco\AppBundle\Helper;

class GeometryHelper
{
    public static function isIncluded(float $lon, float $lat, string $geojson): bool
    {
        $geometry = \geoPHP::load($geojson, 'json');
        $point = \geoPHP::load("POINT($lon $lat)", 'wkt');

        if ('MultiPolygon' === $geometry->getGeomType()) {
            return self::pointInMultiPolygon($geometry, $point);
        }
        if ('Polygon' === $geometry->getGeomType()) {
            return $geometry->pointInPolygon($point);
        }

        throw new \Exception(
            __CLASS__ . ' : geometry type not handled : ' . $geometry->getGeomType()
        );
    }

    public static function pointInMultiPolygon(\MultiPolygon $multiPolygon, \Point $point): bool
    {
        foreach ($multiPolygon->getComponents() as $polygon) {
            if ($polygon->pointInPolygon($point)) {
                return true;
            }
        }

        return false;
    }
}
