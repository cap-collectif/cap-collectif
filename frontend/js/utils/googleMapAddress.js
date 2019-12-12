// @flow

export const getCityFromGoogleAddress = (googleAddress: Object) => {
  if (typeof googleAddress === 'object') googleAddress = JSON.parse(googleAddress.json);

  const locality = googleAddress[0].address_components.find(({ types }) =>
    types.includes('locality'),
  );

  return locality.long_name;
};
