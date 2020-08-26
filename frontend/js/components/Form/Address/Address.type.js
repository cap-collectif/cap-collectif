// @flow

export type FormattedAddress = {|
  +address: string,
  +type: string,
  +latLng: {|
    lat: number,
    lng: number,
  |},
|};

type AddressComplete = {|
  address_components: Array<{
    long_name: string,
    short_name: string,
    types: string[],
  }>,
  formatted_address: string,
  geometry: {
    location: {
      lat: Function,
      lng: Function,
    },
    location_type: string,
    viewport: {
      Va: {
        i: number,
        j: number,
      },
      Za: {
        i: number,
        j: number,
      },
    },
    place_id: string,
    plus_code: {
      compound_code: string,
      global_code: string,
    },
    types: string[],
  },
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
  getAddress?: (address: FormattedAddress) => void,
  getAddressComplete?: (addressComplete: AddressComplete) => void,
  showSearchBar?: boolean,
|};

export type AddressType = 'continent' | 'route' | 'street_address' | 'country' | string;
