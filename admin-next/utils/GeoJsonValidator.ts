import {
    GeoJSON,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
    Position,
} from 'geojson';

const isValidCoordinates = (coords: Position): boolean => {
    return (
        Array.isArray(coords) &&
        coords.length >= 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
    );
};

const isValidArray = (arrayOfThings: Array<any>, validator: Function): boolean => {
    for (const element of arrayOfThings) {
        if (!validator(element)) {
            return false;
        }
    }
    return true;
};

const isValidPoint = (input: Point): boolean => {
    return Array.isArray(input.coordinates) && isValidCoordinates(input.coordinates);
};

const isValidLineString = (input: LineString | MultiPoint): boolean => {
    return Array.isArray(input.coordinates) && isValidArray(input.coordinates, isValidCoordinates);
};

const isValidPolygon = (input: Polygon | MultiLineString): boolean => {
    return (
        Array.isArray(input.coordinates) &&
        isValidArray(input.coordinates, elt => {
            return (
                Array.isArray(elt) &&
                isValidArray(elt, (subElt: Position) => {
                    return Array.isArray(subElt) && isValidCoordinates(subElt);
                })
            );
        })
    );
};

const isValidMultiPolygon = (input: MultiPolygon): boolean => {
    return (
        Array.isArray(input.coordinates) &&
        isValidArray(input.coordinates, elt => {
            return (
                Array.isArray(elt) &&
                isValidArray(elt, subElt => {
                    return (
                        Array.isArray(subElt) &&
                        isValidArray(subElt, subSubElt => {
                            return Array.isArray(subSubElt) && isValidCoordinates(subSubElt);
                        })
                    );
                })
            );
        })
    );
};

const isValidGeometry = (input: GeoJSON): boolean => {
    switch (input.type) {
        case 'Point':
            return isValidPoint(input);
        case 'LineString':
            return isValidLineString(input);
        case 'Polygon':
            return isValidPolygon(input);
        case 'MultiPoint':
            return isValidLineString(input);
        case 'MultiLineString':
            return isValidPolygon(input);
        case 'MultiPolygon':
            return isValidMultiPolygon(input);

        default:
            return false;
    }
};

const isValidFeature = (input: GeoJSON): boolean => {
    return (
        input.type === 'Feature' && input.geometry !== undefined && isValidGeometry(input.geometry)
    );
};

const isValidFeatureCollection = (input: GeoJSON): boolean => {
    if (
        input.type === 'FeatureCollection' &&
        Array.isArray(input.features) &&
        input.features.length
    ) {
        for (const feature of input.features) {
            if (!isValidFeature(feature)) {
                return false;
            }
        }
        return true;
    }
    return false;
};

export const isValid = (input: GeoJSON): boolean => {
    return isValidFeatureCollection(input) || isValidFeature(input);
};
