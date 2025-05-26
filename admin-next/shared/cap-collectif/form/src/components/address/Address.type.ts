export type AddressComplete = {
  address_components: Array<{
    long_name: string
    short_name: string
    types: string[]
  }>
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
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
