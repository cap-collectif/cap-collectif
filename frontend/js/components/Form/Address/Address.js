// @flow
import * as React from 'react';
import PlacesAutocomplete, { getLatLng, geocodeByAddress } from 'react-places-autocomplete';
import { FormattedMessage, useIntl } from 'react-intl';
import Loader from '~ui/FeedbacksIndicators/Loader';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import IconDS, { ICON_NAME as ICON_NAME_DS } from '~ds/Icon/Icon';
import colors from '~/utils/colors';
import config from '~/config';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import { SearchContainer, ButtonLocation, ResultContainer, LoaderContainer } from './Address.style';
import type {
  AddressProps,
  GoogleAddressAPI,
  AddressComplete,
  AddressWithoutPosition,
} from './Address.type';

type Props = {|
  id: string,
  onChange: Function,
  value: ?string,
  placeholder?: string,
  debounce?: number,
  ...AddressProps,
|};

const Address = ({
  id,
  placeholder,
  value = '',
  onChange,
  debounce,
  getPosition,
  getAddress,
  allowReset = true,
  showSearchBar = true,
}: Props) => {
  const [hasLocationAuthorize, setHasLocationAuthorize] = React.useState<boolean>(true);
  const intl = useIntl();
  const hasReset = allowReset && !!value;

  const dispatchLocationWarning = () => {
    FluxDispatcher.dispatch({
      actionType: UPDATE_ALERT,
      alert: {
        type: TYPE_ALERT.ERROR,
        content: 'warning.gps.off',
        extraContent: (
          <a
            href={intl.formatMessage({ id: 'geolocation.help.link' })}
            rel="noopener noreferrer"
            target="_blank"
            className="ml-5">
            <FormattedMessage id="learn.more" />
          </a>
        ),
      },
    });
  };

  const getLocation = () => {
    window.navigator.geolocation.getCurrentPosition(
      position => {
        setHasLocationAuthorize(true);
        if (getPosition) {
          getPosition(position.coords.latitude, position.coords.longitude);
        }
      },
      () => {
        setHasLocationAuthorize(false);
        dispatchLocationWarning();
      },
    );
  };

  const handleSelect = async (address: string) => {
    const addressWithoutPosition: AddressWithoutPosition = await geocodeByAddress(address)
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

        if (getAddress) getAddress(addressComplete);
        onChange(addressComplete.formatted_address);
      })
      .catch(error => console.error('Error', error));
  };

  const onReset = () => {
    if (getAddress) getAddress(null);
    onChange(null);
  };

  return (
    <PlacesAutocomplete
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
      debounce={debounce}>
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="address-container">
          <SearchContainer hasLocationUser={!!getPosition} hasReset={hasReset}>
            {showSearchBar && (
              <>
                <Icon
                  name={ICON_NAME.search}
                  size={15}
                  color={colors.darkGray}
                  className="icon-search"
                />

                <input
                  {...getInputProps({
                    placeholder: placeholder || '',
                    className: 'form-control',
                    id,
                  })}
                />
              </>
            )}

            {hasReset && (
              <button type="button" onClick={onReset} className="btn-reset">
                <IconDS name={ICON_NAME_DS.CROSS} size="md" color="blue.900" />
              </button>
            )}

            {getPosition && (
              <ButtonLocation
                isMobile={config.isMobile}
                type="button"
                onClick={e => {
                  e.preventDefault();
                  getLocation();
                }}>
                <Icon
                  name={
                    hasLocationAuthorize ? ICON_NAME.locationTarget : ICON_NAME.locationNotAuthorize
                  }
                  size={16}
                  color={colors.darkGray}
                />
              </ButtonLocation>
            )}
          </SearchContainer>

          {loading && (
            <LoaderContainer>
              <Loader />
            </LoaderContainer>
          )}

          {suggestions.length > 0 && (
            <ResultContainer id="list-suggestion">
              {suggestions.map((suggestion: GoogleAddressAPI, idx) => (
                <li
                  {...getSuggestionItemProps(suggestion, {
                    className: suggestion.active ? 'suggestion-item--active' : 'suggestion-item',
                    style: { backgroundColor: suggestion.active ? '#fafafa' : '#fff' },
                  })}
                  key={idx}>
                  <span>{suggestion.formattedSuggestion.mainText}</span>{' '}
                  <span>{suggestion.formattedSuggestion.secondaryText}</span>
                </li>
              ))}
            </ResultContainer>
          )}
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default Address;
