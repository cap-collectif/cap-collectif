// @flow

export const getCityFromGoogleAddress = (googleAddress: Object) => {
  if (typeof googleAddress === 'object') googleAddress = JSON.parse(googleAddress.json);

  const locality = googleAddress[0].address_components.find(({ types }) => {
    // sometimes googleApi doesn't send locality
    if (!types.includes('locality')) {
      return types.includes('administrative_area_level_1');
    }

    return types.includes('locality');
  });

  return locality.long_name;
};
