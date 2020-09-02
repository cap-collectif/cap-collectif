// @flow

export type FormattedAddress = {|
  +address: string,
  +type: string,
  +latLng: {|
    lat: number,
    lng: number,
  |},
|};

export type AddressComplete = {|
  address_components: Array<{
    long_name: string,
    short_name: string,
    types: string[],
  }>,
  formatted_address: string,
  geometry: {
    location: {
      lat: number,
      lng: number,
    },
    location_type: string,
    viewport?: {
      Va: {
        i: number,
        j: number,
      },
      Za: {
        i: number,
        j: number,
      },
    },
  },
  place_id?: string,
  plus_code?: {
    compound_code: string,
    global_code: string,
  },
  types: string[],
|};

export type AddressCompleteFormatted = {|
  address: string,
  latLng: {
    lat: number,
    lng: number,
  },
  type: ?string,
  address_components: Array<{
    long_name: string,
    short_name: string,
    types: string[],
  }>,
  addressOriginal: AddressComplete,
|};

export type GoogleAddressAPI = {|
  +active: boolean,
  +description: string,
  +formattedSuggestion: {|
    +mainText: string,
    +secondaryText: string,
  |},
  +id: ?string,
  +index: number,
  +matchedSubstrings: Array<{
    length: number,
    offset: number,
  }>,
  placeId: string,
  terms: Array<{
    offset: number,
    value: string,
  }>,
  types: string[],
|};

export type AddressProps = {|
  getPosition?: (lat: number, lng: number) => void,
  getAddress?: (address: AddressComplete) => void,
  showSearchBar?: boolean,
|};

// AddressType => https://developers.google.com/places/supported_types
export type AddressType =
  | 'continent'
  | 'route'
  | 'street_address'
  | 'country'
  | 'point_of_interest'
  | 'locality'
  | ?string;
