// @flow
import * as React from 'react';
import PlacesAutocomplete, { getLatLng, geocodeByAddress } from 'react-places-autocomplete';
import { FormattedMessage, useIntl } from 'react-intl';
import Loader from '~ui/FeedbacksIndicators/Loader';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import config from '~/config';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import { SearchContainer, ButtonLocation, ResultContainer, LoaderContainer } from './Address.style';
import type { AddressProps, GoogleAddressAPI, AddressComplete } from './Address.type';

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
  showSearchBar = true,
}: Props) => {
  const [hasLocationAuthorize, setHasLocationAuthorize] = React.useState<boolean>(true);
  const intl = useIntl();

  const onErrorGeolocation = () => setHasLocationAuthorize(false);

  const getLocation = () => {
    if (hasLocationAuthorize) {
      window.navigator.geolocation.getCurrentPosition(position => {
        if (getPosition) {
          getPosition(position.coords.latitude, position.coords.longitude);
        }
      }, onErrorGeolocation);
    } else {
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
    }
  };

  const handleSelect = (address: string) => {
    let formattedAddress = {};

    // react-places-autocomplete use onSelect and not onChange when a suggestion is selected
    // then we don't need to make all request if we just want an onChange()
    if (!getAddress) onChange(address);

    return geocodeByAddress(address)
      .then(results => {
        // eslint-disable-next-line prefer-destructuring
        formattedAddress = results[0];
        return getLatLng(results[0]);
      })
      .then(latLng => {
        formattedAddress.geometry.location = {
          lat: latLng.lat,
          lng: latLng.lng,
        };

        if (getAddress) getAddress(((formattedAddress: any): AddressComplete));
        onChange(address);
      })
      .catch(error => console.error('Error', error));
  };

  React.useEffect(() => {
    window.navigator.permissions.query({ name: 'geolocation' }).then(permission => {
      if (permission.state === 'granted' || permission.state === 'prompt') {
        setHasLocationAuthorize(true);
      } else {
        setHasLocationAuthorize(false);
      }
    });
  }, []);

  return (
    <PlacesAutocomplete
      value={value}
      onChange={onChange}
      onSelect={handleSelect}
      onError={() => onChange('')}
      debounce={debounce}>
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div className="address-container">
          <SearchContainer hasLocationUser={!!getPosition}>
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

            {getPosition && (
              <ButtonLocation
                isMobile={config.isMobile}
                type="button"
                onClick={e => {
                  e.preventDefault();
                  getLocation();
                }}
                disabled={!hasLocationAuthorize}>
                {hasLocationAuthorize ? (
                  <Icon name={ICON_NAME.locationTarget} size={16} color={colors.darkGray} />
                ) : (
                  <Icon name={ICON_NAME.locationNotAuthorize} size={16} color={colors.darkGray} />
                )}
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
                    style: suggestion.active
                      ? {
                          backgroundColor: '#fafafa',
                        }
                      : { backgroundColor: '#fff' },
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
