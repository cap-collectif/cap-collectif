<?php

namespace Capco\AppBundle\Helper;

class GeometryHelper
{
    public static function isIncluded(float $lon, float $lat, string $geojson): bool
    {
        $geometry = \geoPHP::load($geojson, 'json');
        $point = \geoPHP::load("POINT(${lon} ${lat})", 'wkt');

        if ('MultiPolygon' === $geometry->getGeomType()) {
            return self::pointInMultiPolygon($geometry, $point);
        }
        if ('Polygon' === $geometry->getGeomType()) {
            return self::pointInPolygon($geometry, $point);
        }

        throw new \Exception(
            __CLASS__ . ' : geometry type not handled : ' . $geometry->getGeomType()
        );
    }

    public static function pointInMultiPolygon(\MultiPolygon $multiPolygon, \Point $point): bool
    {
        foreach ($multiPolygon->getComponents() as $polygon) {
            if (self::pointInPolygon($polygon, $point)) {
                return true;
            }
        }

        return false;
    }

    // https://en.wikipedia.org/wiki/Point_in_polygon
    public static function pointInPolygon(\Polygon $polygon, \Point $point): bool
    {
        if (self::isPointVertexOfPolygon($polygon, $point)) {
            return true;
        }

        $intersections = 0;
        foreach ($polygon->getComponents() as $polygonComponent) {
            $points = $polygonComponent->getPoints();
            for ($i = 1; $i < \count($points); ++$i) {
                $vertexA = $points[$i - 1];
                $vertexB = $points[$i];
                if (self::isPointOnHorizontalBoundary($vertexA, $vertexB, $point)) {
                    return true;
                }
                if (self::doesIntersect($vertexA, $vertexB, $point)) {
                    ++$intersections;
                }
            }
        }

        return 0 != $intersections % 2;
    }

    private static function isPointVertexOfPolygon(\Polygon $polygon, \Point $point): bool
    {
        foreach ($polygon->getPoints() as $vertex) {
            if ($point->equals($vertex)) {
                return true;
            }
        }

        return false;
    }

    private static function isPointOnHorizontalBoundary(
        \Point $vertexA,
        \Point $vertexB,
        \Point $point
    ): bool {
        return $vertexA->y() == $vertexB->y() &&
            $vertexA->y() == $point->y() &&
            $point->x() > min($vertexA->x(), $vertexB->x()) &&
            $point->x() < max($vertexA->x(), $vertexB->x());
    }

    private static function doesIntersect(\Point $vertexA, \Point $vertexB, \Point $point): bool
    {
        if (
            $point->y() > min($vertexA->y(), $vertexB->y()) &&
            $point->y() <= max($vertexA->y(), $vertexB->y()) &&
            $point->x() <= max($vertexA->x(), $vertexB->x()) &&
            $vertexA->y() != $vertexB->y()
        ) {
            $intersectionX =
                (($point->y() - $vertexA->y()) * ($vertexB->x() - $vertexA->x())) /
                    ($vertexB->y() - $vertexA->y()) +
                $vertexA->x();
            if ($vertexA->x() == $vertexB->x() || $point->x() <= $intersectionX) {
                return true;
            }
        }

        return false;
    }
}
