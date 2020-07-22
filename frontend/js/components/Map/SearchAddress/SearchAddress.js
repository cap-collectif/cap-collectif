// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLeaflet } from 'react-leaflet';
import debounce from 'debounce-promise';
import { GoogleProvider } from 'leaflet-geosearch';
import { connect } from 'react-redux';
import {
  Container,
  SearchContainer,
  ResultContainer,
  Result,
  ButtonLocation,
} from './SearchAddress.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import config from '~/config';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { TYPE_ALERT, UPDATE_ALERT } from '~/constants/AlertConstants';
import type { State } from '~/types';

type Props = {|
  language: string,
  className?: string,
  address?: string,
  getPosition?: (lat: number, lng: number) => void,
|};

export const SearchAddress = ({
  className,
  getPosition,
  language,
  address: addressPreFilled,
}: Props) => {
  const intl = useIntl();
  const { map } = useLeaflet();

  const [address, setAddress] = React.useState<string>(addressPreFilled || '');
  const [results, setResults] = React.useState([]);
  const [hasLocationAuthorize, setHasLocationAuthorize] = React.useState<boolean>(true);

  const googleProvider = new GoogleProvider({
    params: {
      key: config.mapsServerKey,
      components: `country:${language}`,
    },
  });

  const fetchAddress = value => googleProvider.search({ query: value });
  const fetchAddressDebounce = debounce(fetchAddress, 1200);

  const handleAddress = async (value: string) => {
    setAddress(value);

    const result = await fetchAddressDebounce(value);
    setResults(result);
  };

  React.useEffect(() => {
    if (addressPreFilled) setAddress(addressPreFilled);

    map.on('locationfound', location => {
      setHasLocationAuthorize(true);

      if (getPosition) {
        getPosition(location.latitude, location.longitude);
      }
    });

    map.on('locationerror', () => {
      setHasLocationAuthorize(false);

      FluxDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: {
          type: TYPE_ALERT.ERROR,
          content: 'warning.gps.off',
          extraContent: (
            <a
              href="https://aide.cap-collectif.com/article/172-autoriser-la-geolocalisation"
              rel="noopener noreferrer"
              target="_blank"
              className="ml-5">
              <FormattedMessage id="learn.more" />
            </a>
          ),
        },
      });
    });
  }, [addressPreFilled, getPosition, map]);

  const getLocation = () => {
    map.locate();
  };

  return (
    <Container className={className}>
      <SearchContainer>
        <Icon name={ICON_NAME.search} size={15} color={colors.darkGray} className="icon-search" />
        <input
          type="text"
          value={address}
          onChange={e => handleAddress(e.target.value)}
          placeholder={intl.formatMessage({ id: 'map.search.placeholder.text' })}
        />

        <ButtonLocation type="button" onClick={getLocation} disabled={!hasLocationAuthorize}>
          {hasLocationAuthorize ? (
            <Icon name={ICON_NAME.locationTarget} size={16} color={colors.darkGray} />
          ) : (
            <Icon name={ICON_NAME.locationNotAuthorize} size={16} color={colors.darkGray} />
          )}
        </ButtonLocation>
      </SearchContainer>

      {results.filter(result => result.label !== address).length > 0 && address && (
        <ResultContainer>
          {results.map((result, idx) => (
            <Result key={idx}>
              <button type="button" onClick={() => setAddress(result.label)}>
                {result.label}
              </button>
            </Result>
          ))}
        </ResultContainer>
      )}
    </Container>
  );
};

const mapStateToProps = (state: State) => ({
  language: state.default.parameters['events.map.country'],
});

export default connect(mapStateToProps)(SearchAddress);
