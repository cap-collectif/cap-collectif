<?php

namespace Capco\AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

class CheckGeoJsonValidator extends ConstraintValidator
{
    public function validate($geoJson, Constraint $constraint)
    {
        if (null === $geoJson) {
            return;
        }
        $decoded = json_decode($geoJson);
        if ($decoded && self::isValidGeoJson($decoded)) {
            return;
        }

        $this->context->buildViolation($constraint->message)->addViolation();
    }

    public static function isValidGeoJson($geoJson): bool
    {
        return self::isValidFeatureCollection($geoJson) || self::isValidFeature($geoJson);
    }

    private static function isValidFeatureCollection($featureCollection): bool
    {
        if (
            !isset($featureCollection->type) ||
            !isset($featureCollection->features) ||
            'FeatureCollection' !== $featureCollection->type ||
            !\is_array($featureCollection->features) ||
            empty($featureCollection->features)
        ) {
            return false;
        }
        foreach ($featureCollection->features as $feature) {
            if (!self::isValidFeature($feature)) {
                return false;
            }
        }

        return true;
    }

    private static function isValidFeature($feature): bool
    {
        return isset($feature->type) &&
            isset($feature->geometry) &&
            'Feature' === $feature->type &&
            self::isValidGeometryType($feature->geometry);
    }

    private static function isValidGeometryType($geometry): bool
    {
        if (!isset($geometry->type) || !isset($geometry->coordinates)) {
            return false;
        }
        switch ($geometry->type) {
            case 'Point':
                return self::isValidPoint($geometry);
            case 'LineString':
                return self::isValidLineString($geometry);
            case 'Polygon':
                return self::isValidPolygon($geometry);
            case 'MultiPoint':
                return self::isValidMultiPoint($geometry);
            case 'MultiLineString':
                return self::isValidMultiLineString($geometry);
            case 'MultiPolygon':
                return self::isValidMultiPolygon($geometry);
        }

        return false;
    }

    private static function isValidPoint($point): bool
    {
        return self::isValidCoordinates($point->coordinates);
    }

    private static function isValidLineString($lineString): bool
    {
        return self::isValidArrayOfSomething($lineString->coordinates, function ($coordinates) {
            return self::isValidCoordinates($coordinates);
        });
    }

    private static function isValidPolygon($polygon): bool
    {
        return self::isValidArrayOfSomething($polygon->coordinates, function ($arrayOfCoordinates) {
            return self::isValidArrayOfSomething($arrayOfCoordinates, function ($coordinates) {
                return self::isValidCoordinates($coordinates);
            });
        });
    }

    private static function isValidMultiPoint($multiPoint): bool
    {
        return self::isValidArrayOfSomething($multiPoint->coordinates, function ($coordinates) {
            return self::isValidCoordinates($coordinates);
        });
    }

    private static function isValidMultiLineString($multiLineString): bool
    {
        return self::isValidArrayOfSomething($multiLineString->coordinates, function (
            $arrayOfCoordinates
        ) {
            return self::isValidArrayOfSomething($arrayOfCoordinates, function ($coordinates) {
                return self::isValidCoordinates($coordinates);
            });
        });
    }

    private static function isValidMultiPolygon($multiPolygon): bool
    {
        return self::isValidArrayOfSomething($multiPolygon->coordinates, function (
            $arrayOfArrayOfCoordinates
        ) {
            return self::isValidArrayOfSomething($arrayOfArrayOfCoordinates, function (
                $arrayOfCoordinates
            ) {
                return self::isValidArrayOfSomething($arrayOfCoordinates, function ($coordinates) {
                    return self::isValidCoordinates($coordinates);
                });
            });
        });
    }

    private static function isValidArrayOfSomething($arrayOfSomething, callable $validator): bool
    {
        if (!self::isValidAndNotEmptyArray($arrayOfSomething)) {
            return false;
        }
        foreach ($arrayOfSomething as $something) {
            if (!$validator($something)) {
                return false;
            }
        }

        return true;
    }

    private static function isValidAndNotEmptyArray($array): bool
    {
        return \is_array($array) && !empty($array);
    }

    private static function isValidCoordinates($coordinates): bool
    {
        return \is_array($coordinates) &&
            2 <= \count($coordinates) &&
            is_numeric($coordinates[0]) &&
            is_numeric($coordinates[1]);
    }
}
