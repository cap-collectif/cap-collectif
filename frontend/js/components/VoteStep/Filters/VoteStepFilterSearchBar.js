// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import PlacesAutocomplete, { getLatLng, geocodeByAddress } from 'react-places-autocomplete';
import {
  Box,
  CapUIFontFamily,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Dropdown,
  Flex,
  Icon,
  toast,
} from '@cap-collectif/ui';
import { getAddressFromLatLng } from '~/utils/googleMapAddress';
import type {
  AddressComplete,
  AddressWithoutPosition,
} from '~/components/Form/Address/Address.type';
import { useVoteStepContext } from '~/components/VoteStep/Context/VoteStepContext';

const VoteStepFilterSearchBar = () => {
  const intl = useIntl();
  const [hasLocationAuthorize, setHasLocationAuthorize] = React.useState<boolean>(true);
  const [lookupLocation, setLookupLocation] = React.useState<boolean>(false);
  const { filters, setFilters } = useVoteStepContext();
  const { latlng: filterLatLng, address } = filters;

  React.useEffect(() => {
    if (filterLatLng) {
      getAddressFromLatLng(JSON.parse(filterLatLng)).then(result => {
        setFilters('address', result.formatted_address);
        setLookupLocation(false);
      });
    }
  }, [filterLatLng, setFilters]);

  const getLocation = () => {
    window.navigator.geolocation.getCurrentPosition(
      coords => {
        setLookupLocation(true);
        setHasLocationAuthorize(true);
        const latlng = { lat: coords.coords.latitude, lng: coords.coords.longitude };
        getAddressFromLatLng(latlng).then(result => {
          setFilters('address', result.formatted_address);
          setFilters(
            'latlng',
            JSON.stringify({
              lat: latlng.lat,
              lng: latlng.lng,
            }),
          );
          setLookupLocation(false);
        });
      },
      () => {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({ id: 'geo.search.bar.error.toast' }),
        });
        setHasLocationAuthorize(false);
        setLookupLocation(false);
      },
    );
  };

  const handleSelect = async (_address: string) => {
    const addressWithoutPosition: AddressWithoutPosition = await geocodeByAddress(_address)
      .then((results: AddressWithoutPosition[]) => {
        // There is no lat & lng here
        return results[0];
      })
      .catch(error => console.error('Error', error));

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
        };
        setFilters('address', addressComplete.formatted_address);
        setFilters(
          'latlng',
          JSON.stringify({
            lat: latLng.lat,
            lng: latLng.lng,
          }),
        );
      })
      .catch(error => console.error('Error', error));
  };

  const onChange = _address => {
    setFilters('latlng', '');
    setFilters('address', _address);
  };

  return (
    <PlacesAutocomplete value={address} onChange={onChange} onSelect={handleSelect}>
      {({ getInputProps, suggestions, getSuggestionItemProps }) => (
        <Flex direction="column" justifyContent="center" alignItems="flex-start" gap="4px" mb={6}>
          <Flex
            direction="row"
            width="100%"
            boxShadow="small"
            sx={{
              padding: '6px',
              fontFamily: CapUIFontFamily.Input,
              lineHeight: CapUILineHeight.Base,
              color: 'gray.900',
              bg: 'white',
            }}>
            <Box
              as="button"
              onClick={e => {
                e.preventDefault();
                getLocation();
              }}
              type="button"
              sx={{
                padding: 0,
                cursor: 'pointer',
                background: 'inherit',
                borderWidth: '0px',
                display: 'flex',
                alignItems: 'center',
              }}>
              {hasLocationAuthorize ? (
                <Icon name={CapUIIcon.LocationTarget} size={CapUIIconSize.Md} color="gray.900" />
              ) : (
                <Icon
                  name={CapUIIcon.LocationTargetRefused}
                  size={CapUIIconSize.Md}
                  color="gray.900"
                />
              )}
            </Box>
            <Box
              as="input"
              disableFocusStyles
              width="100%"
              bg="inherit"
              {...getInputProps({
                placeholder: lookupLocation
                  ? intl.formatMessage({ id: 'geo.search.bar.placeholder.loading' })
                  : intl.formatMessage({ id: 'geo.search.bar.placeholder' }),
                className: 'geo-search-bar-input',
              })}
              sx={{ background: 'inherit', borderWidth: '0px', fontSize: '14px !important' }}
            />
          </Flex>
          <Flex width="100%" position="relative">
            {suggestions.length > 0 && (
              <Dropdown
                className="cap-address__dropdown"
                sx={{ paddingInlineStart: 0, position: 'absolute', width: '100% !important' }}>
                {suggestions.map(suggestion => (
                  <Dropdown.Item
                    sx={{ textAlign: 'start', fontSize: '14px !important' }}
                    key={suggestion.id}
                    {...getSuggestionItemProps(suggestion)}>
                    {suggestion.description}
                  </Dropdown.Item>
                ))}
              </Dropdown>
            )}
          </Flex>
        </Flex>
      )}
    </PlacesAutocomplete>
  );
};

export default VoteStepFilterSearchBar;
