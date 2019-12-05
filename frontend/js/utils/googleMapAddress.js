// @flow

export const getCityFromGoogleAddress = (googleAddress: Object) => {
  let city = '';

  if (typeof googleAddress === 'object') googleAddress = JSON.parse(googleAddress.json);

  const locality = googleAddress[0].address_components.find(({ types }) =>
    types.includes('locality'),
  );

  city = locality.long_name;
  return city;
};
