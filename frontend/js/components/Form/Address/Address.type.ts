export type FormattedAddress = {
  readonly address: string
  readonly type: string
  readonly latLng: {
    lat: number
    lng: number
  }
}
export type AddressComplete = {
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  formatted_address: string
  geometry: {
    location: {
      readonly lat: number
      readonly lng: number
    }
    location_type: string
    viewport?: {
      Va: {
        i: number
        j: number
      }
      Za: {
        i: number
        j: number
      }
    }
  }
  place_id?: string
  plus_code?: {
    compound_code: string
    global_code: string
  }
  types: string[]
}
export type AddressWithoutPosition = AddressComplete & {
  geometry: {
    location: {
      lat: void
      lng: void
    }
    location_type: string
    viewport?: {
      Va: {
        i: number
        j: number
      }
      Za: {
        i: number
        j: number
      }
    }
  }
}
export type AddressCompleteFormatted = {
  address: string
  latLng: {
    lat: number
    lng: number
  }
  type: string | null | undefined
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  addressOriginal: AddressComplete
}
export type GoogleAddressAPI = {
  readonly active: boolean
  readonly description: string
  readonly formattedSuggestion: {
    readonly mainText: string
    readonly secondaryText: string
  }
  readonly id: string | null | undefined
  readonly index: number
  readonly matchedSubstrings: Array<{
    length: number
    offset: number
  }>
  placeId: string
  terms: Array<{
    offset: number
    value: string
  }>
  types: string[]
}
export type AddressProps = {
  getPosition?: (lat: number, lng: number) => void
  getAddress?: (address: AddressComplete | null | undefined) => void
  showSearchBar?: boolean
  allowReset?: boolean
}
// AddressType => https://developers.google.com/places/supported_types
export type AddressType =
  | 'continent'
  | 'route'
  | 'street_address'
  | 'country'
  | 'point_of_interest'
  | 'locality'
  | (string | null | undefined)
