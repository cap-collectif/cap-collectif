// @ts-nocheck
import * as React from 'react'
import PlacesAutocomplete, { getLatLng, geocodeByAddress } from 'react-places-autocomplete'
import {
  Box,
  Button,
  CapUIFontFamily,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Dropdown,
  Flex,
  Icon,
  toast,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import type { AddressComplete, AddressWithoutPosition } from '../../Form/Address/Address.type'
import { SearchLabel } from '~ds/GeoSearchBar/GeoSearchBar.style'
import { getAddressFromLatLng } from '~/utils/googleMapAddress'
import useIsMobile from '~/utils/hooks/useIsMobile'

type Props = {
  baseUrl: string
}

const GeoSearchBar = ({ baseUrl }: Props) => {
  const intl = useIntl()
  const [hasLocationAuthorize, setHasLocationAuthorize] = React.useState<boolean>(true)
  const [lookupLocation, setLookupLocation] = React.useState<boolean>(false)
  const [address, setAddress] = React.useState<string>('')
  const [location, setLocation] = React.useState<string | null>(null)
  const isMobile = useIsMobile()

  const onButtonClick = () => {
    if (location) {
      window.open(`/${baseUrl}?latlng=${location}&view=map`, '_self')
    }
  }

  const getLocation = () => {
    window.navigator.geolocation.getCurrentPosition(
      coords => {
        setLookupLocation(true)
        setHasLocationAuthorize(true)
        const latlng = {
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
        }
        getAddressFromLatLng(latlng).then(result => {
          setAddress(result.formatted_address)
          setLocation(JSON.stringify(latlng))
          setLookupLocation(false)
        })
      },
      () => {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({
            id: 'geo.search.bar.error.toast',
          }),
        })
        setHasLocationAuthorize(false)
        setLookupLocation(false)
      },
    )
  }

  const handleSelect = async (_address: string) => {
    const addressWithoutPosition: AddressWithoutPosition = await geocodeByAddress(_address)
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
        setAddress(addressComplete.formatted_address)
        setLocation(
          JSON.stringify({
            lat: latLng.lat,
            lng: latLng.lng,
          }),
        )
      })
      .catch(error => console.error('Error', error))
  }

  return (
    <PlacesAutocomplete value={address} onChange={_address => setAddress(_address)} onSelect={handleSelect}>
      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          padding={6}
          bg="#9CD8D9"
          height={isMobile ? '100%' : '124px'}
          width={isMobile ? '100%' : '600px'}
          gap="4px"
        >
          <SearchLabel>
            {intl.formatMessage({
              id: 'geo.search.label',
            })}
          </SearchLabel>
          <Flex direction={isMobile ? 'column' : 'row'} width="100%" gap={1}>
            <Flex
              direction="row"
              width={isMobile ? '100%' : '80%'}
              sx={{
                border: 'normal',
                borderRadius: 'normal',
                borderColor: 'gray.300',
                padding: '12px',
                fontFamily: CapUIFontFamily.Input,
                lineHeight: CapUILineHeight.Base,
                color: 'gray.900',
                bg: 'white',
              }}
            >
              <Box
                as="button"
                onClick={e => {
                  e.preventDefault()
                  getLocation()
                }}
                type="button"
                sx={{
                  cursor: 'pointer',
                  background: 'inherit',
                  borderWidth: '0px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {hasLocationAuthorize ? (
                  <Icon name={CapUIIcon.LocationTarget} size={CapUIIconSize.Lg} color="gray.900" />
                ) : (
                  <Icon name={CapUIIcon.LocationTargetRefused} size={CapUIIconSize.Lg} color="gray.900" />
                )}
              </Box>
              <Box
                as="input"
                disableFocusStyles
                width="100%"
                bg="inherit"
                {...getInputProps({
                  placeholder: lookupLocation
                    ? intl.formatMessage({
                        id: 'geo.search.bar.placeholder.loading',
                      })
                    : intl.formatMessage({
                        id: 'geo.search.bar.placeholder',
                      }),
                  className: 'geo-search-bar-input',
                })}
                sx={{
                  background: 'inherit',
                  borderWidth: '0px',
                  fontSize: '14px !important',
                }}
              />
            </Flex>
            <Button
              onClick={onButtonClick}
              aria-disabled={address === ''}
              sx={{
                width: isMobile ? '100%' : '20%',
                backgroundColor: 'white !important',
                color: ' #9CD8D9!important',
                display: 'grid',
                placeContent: 'center',
                fontWeight: '400 !important',
                fontSize: '15px !important',
                lineHeight: '22px !important',
                height: '48px',
              }}
            >
              {intl.formatMessage({
                id: 'global.menu.search',
              })}
            </Button>
          </Flex>
          <Flex width="79%" position="relative">
            {suggestions.length > 0 && (
              <Dropdown
                className="cap-address__dropdown"
                sx={{
                  paddingInlineStart: 0,
                  position: 'absolute',
                  width: '100% !important',
                }}
              >
                {suggestions.map(suggestion => (
                  <Dropdown.Item
                    sx={{
                      textAlign: 'start',
                      fontSize: '14px !important',
                    }}
                    key={suggestion.id}
                    {...getSuggestionItemProps(suggestion)}
                  >
                    {suggestion.description}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            )}
          </Flex>
        </Flex>
      )}
    </PlacesAutocomplete>
  )
}

export default GeoSearchBar
