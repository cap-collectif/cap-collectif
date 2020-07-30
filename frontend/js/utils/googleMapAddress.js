// @flow

export const getCityFromGoogleAddress = (googleAddressJson: string): ?string => {
  const googleAddress = JSON.parse(googleAddressJson);

  const locality = googleAddress[0].address_components.find(({ types }) => {
    // sometimes googleApi doesn't send locality
    if (!types.includes('locality')) {
      return types.includes('administrative_area_level_1');
    }

    return types.includes('locality');
  });

  return locality.long_name;
};
