// @flow
import type {
  AddressComplete,
  AddressCompleteFormatted,
  AddressType,
} from '~/components/Form/Address/Address.type';

export const getCityFromGoogleAddress = (address: AddressCompleteFormatted): ?string => {
  const locality = address.address_components.find(({ types }) => {
    // sometimes googleApi doesn't send locality
    if (!types.includes('locality')) {
      return types.includes('administrative_area_level_1');
    }

    return types.includes('locality');
  });

  return locality?.long_name;
};

export const getDataFromGoogleAddress = (
  address: AddressCompleteFormatted,
  typeSelected: AddressType,
): string => {
  const data = address.address_components.find(({ types }) => {
    if (types.includes(typeSelected)) return types.includes(typeSelected);

    // default case
    if (!types.includes(typeSelected)) return types.includes('locality');
    if (!types.includes('locality')) return types.includes('administrative_area_level_1');
  });

  return data?.long_name || '';
};

export const formatAddressFromGoogleAddress = ({
  formatted_address,
  geometry,
  types,
  address_components,
  ...rest
}: AddressComplete): AddressCompleteFormatted => ({
  address: formatted_address,
  latLng: {
    lat: geometry.location.lat,
    lng: geometry.location.lng,
  },
  type: types ? types[0] : null,
  address_components,
  addressOriginal: {
    formatted_address,
    geometry,
    types,
    address_components,
    ...rest,
  },
});
