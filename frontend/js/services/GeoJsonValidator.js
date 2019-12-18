// @flow

const isValidCoordinates = (coords: any): boolean => {
  return Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number';
};

const isValidArray = (arrayOfThings: Array<any>, validator: function): boolean => {
  for (const element of arrayOfThings) {
    if (!validator(element)) {
      return false;
    }
  }
  return true;
};

const isValidPoint = (input: Object): boolean => {
  return Array.isArray(input.coordinates) && isValidCoordinates(input.coordinates);
};

const isValidLineString = (input: Object): boolean => {
  return (
    Array.isArray(input.coordinates) &&
    isValidArray(input.coordinates, isValidCoordinates)
  );
};

const isValidPolygon = (input: Object): boolean => {
  return (
    Array.isArray(input.coordinates) &&
    isValidArray(input.coordinates, elt => {
      return (
        Array.isArray(elt) &&
        isValidArray(elt, subElt => {
          return Array.isArray(subElt) && isValidCoordinates(subElt);
        })
      );
    })
  );
};

const isValidMultiPolygon = (input: Object): boolean => {
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

const isValidGeometry = (input: Object): boolean => {
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

const isValidFeature = (input: Object): boolean => {
  return (
    input.type === 'Feature' && input.geometry !== 'undefined' && isValidGeometry(input.geometry)
  );
};

const isValidFeatureCollection = (input: Object): boolean => {
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

export const isValid = (input: Object): boolean => {
  return isValidFeatureCollection(input) || isValidFeature(input);
};
