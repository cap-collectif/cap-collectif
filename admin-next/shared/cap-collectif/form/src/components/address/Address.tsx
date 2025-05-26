// @ts-nocheck
import React, { forwardRef } from 'react'
import { Dropdown, Input, InputProps } from '@cap-collectif/ui'
import cn from 'classnames'
import PlacesAutocomplete, {
  getLatLng,
  geocodeByAddress,
} from 'react-places-autocomplete'

import type { AddressComplete, AddressWithoutPosition } from './Address.type'
import { BaseField } from '../fieldInput'

export type AddressProps = BaseField &
  InputProps & {
  getAddress?: (address: AddressComplete) => void
  getPosition?: (lat: number, lng: number) => void
}

const Address = forwardRef<HTMLInputElement, AddressProps>(
  (
    {
      value,
      onChange,
      placeholder,
      className,
      width,
      getAddress,
      getPosition,
      ...props
    },
    ref
  ) => {
    const handleSelect = async (address: string) => {
      const addressWithoutPosition: AddressWithoutPosition =
        await geocodeByAddress(address)
          .then((results: AddressWithoutPosition[]) => {
            // There is no lat & lng here
            return results[0]
          })
          .catch(error => console.error('Error', error))

      await getLatLng(addressWithoutPosition)
        .then(latLng => {
          const addressComplete: AddressComplete = {
            ...addressWithoutPosition,
            geometry: {
              ...addressWithoutPosition.geometry,
              location: {
                lat: latLng.lat,
                lng: latLng.lng,
              },
            },
          }
          if (getPosition) getPosition(latLng.lat, latLng.lng)
          if (getAddress) getAddress(addressComplete)
          onChange(addressComplete.formatted_address)
        })
        .catch(error => console.error('Error', error))
    }
    return (
      <PlacesAutocomplete
        value={value}
        onChange={onChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps }) => (
          <>
            <Input
              ref={ref}
              width={width}
              {...getInputProps({
                placeholder: placeholder,
                className: cn('cap-address__input', className),
              })}
              {...props}
            />
            {suggestions.length > 0 && (
              <Dropdown
                zIndex={1000}
                width={width}
                className={cn('cap-address__dropdown', className)}
              >
                {suggestions.map(suggestion => (
                  <Dropdown.Item
                    key={suggestion.id}
                    {...getSuggestionItemProps(suggestion)}
                  >
                    {suggestion.description}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            )}
          </>
        )}
      </PlacesAutocomplete>
    )
  }
)

Address.displayName = 'Address'

export default Address
