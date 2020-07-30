// @flow
import * as React from 'react';
import { change, Field, getFormSyncErrors } from 'redux-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, fetchQuery, graphql } from 'react-relay';
import { Panel } from 'react-bootstrap';
import L from 'leaflet';
import { Map, Marker, TileLayer, ZoomControl } from 'react-leaflet';
import viewChoice from './ViewChoice/ViewChoice';
import {
  PanelHeader,
  MapViewContent,
  MapContainer,
  ButtonToggleView,
  Error,
} from './SectionDisplayMode.style';
import IconMapView from '~svg/map_view.svg';
import IconGridView from '~svg/grid_view.svg';
import IconListView from '~svg/list_view.svg';
import component from '~/components/Form/Field';
import {
  formName,
  zoomLevels,
  selector as formSelector,
} from '~/components/ProposalForm/ProposalFormAdminConfigurationForm';
import SearchAddress from '~/components/Map/SearchAddress/SearchAddress';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';
import PopoverToggleView from './PopoverToggleView/PopoverToggleView';
import environment from '~/createRelayEnvironment';
import { getCityFromGoogleAddress } from '~/utils/googleMapAddress';
import type { SectionDisplayMode_proposalForm } from '~relay/SectionDisplayMode_proposalForm.graphql';
import type { SectionDisplayMode_GeoCodeQueryQueryResponse } from '~relay/SectionDisplayMode_GeoCodeQueryQuery.graphql';

const publicToken =
  '***REMOVED***';

export const LOCATION_PARIS = {
  lat: 48.8534,
  lng: 2.3488,
};

const getStepsDependOfView = (
  proposalForm: SectionDisplayMode_proposalForm,
  viewSearched: 'grid' | 'list' | 'map',
) => {
  const firstCollectStep = proposalForm.step?.project?.firstCollectStep;

  return proposalForm.step?.project?.steps.filter(Boolean).filter(step => {
    if (step.__typename === 'CollectStep') {
      if (step.mainView === 'grid' && step.form?.isGridViewEnabled && viewSearched === 'grid')
        return true;
      if (step.mainView === 'list' && step.form?.isListViewEnabled && viewSearched === 'list')
        return true;
      if (step.mainView === 'map' && step.form?.isMapViewEnabled && viewSearched === 'map')
        return true;
    }

    if (step.__typename === 'SelectionStep') {
      if (
        step.mainView === 'grid' &&
        firstCollectStep?.form?.isGridViewEnabled &&
        viewSearched === 'grid'
      ) {
        return true;
      }

      if (
        step.mainView === 'list' &&
        firstCollectStep?.form?.isListViewEnabled &&
        viewSearched === 'list'
      ) {
        return true;
      }

      if (
        step.mainView === 'map' &&
        firstCollectStep?.form?.isMapViewEnabled &&
        viewSearched === 'map'
      ) {
        return true;
      }
    }
  });
};

type Props = {|
  dispatch: Dispatch,
  latitude: number,
  longitude: number,
  zoom?: number,
  isMapViewEnabled: boolean,
  proposalForm: SectionDisplayMode_proposalForm,
  errorViewEnabled: ?string,
|};

const USER_LOCATION_QUERY = graphql`
  query SectionDisplayMode_GeoCodeQueryQuery($latitude: Float!, $longitude: Float!) {
    results: geocode(latitude: $latitude, longitude: $longitude) {
      formatted
      json
    }
  }
`;

export const loadLocationUser = (
  latitude: number,
  longitude: number,
): Promise<?{|
  +formatted: ?string,
  +json: string,
|}> =>
  new Promise(async resolve => {
    const response: ?SectionDisplayMode_GeoCodeQueryQueryResponse = await fetchQuery(
      environment,
      USER_LOCATION_QUERY,
      {
        latitude,
        longitude,
      },
    );
    resolve(response ? response.results : null);
  });

export const SectionDisplayMode = ({
  latitude,
  longitude,
  zoom,
  dispatch,
  isMapViewEnabled,
  proposalForm,
  errorViewEnabled,
}: Props) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const [city, setCity] = React.useState(null);
  const [address, setAddress] = React.useState('');

  const refMap = React.useRef(null);
  const intl = useIntl();
  const isMapDisplay = isMapViewEnabled && isOpen;
  const position = [latitude || LOCATION_PARIS.lat, longitude || LOCATION_PARIS.lng];

  const stepsGrid = getStepsDependOfView(proposalForm, 'grid');
  const stepsList = getStepsDependOfView(proposalForm, 'list');
  const stepsMap = getStepsDependOfView(proposalForm, 'map');

  const getLocationUser = async (lat: number, lng: number) => {
    const dataLocationUser = await loadLocationUser(lat, lng);
    if (dataLocationUser) {
      const cityUser = getCityFromGoogleAddress(dataLocationUser.json);
      setCity(cityUser);
      setAddress(dataLocationUser?.formatted);
    }
  };

  const setPosition = React.useCallback(
    (lat: number, lng: number, zoomId?: number) => {
      const zoomBuilding = zoomLevels[zoomLevels.length - 1];

      getLocationUser(lat, lng);
      dispatch(change(formName, 'latMap', lat));
      dispatch(change(formName, 'lngMap', lng));
      dispatch(change(formName, 'zoomMap', zoomId || zoomBuilding.id));

      if (refMap.current?.leafletElement) {
        refMap.current.leafletElement.setView([lat, lng], zoomId || zoomBuilding.id);
      }
    },
    [dispatch],
  );

  React.useEffect(() => {
    if (isMapDisplay && refMap) {
      if (!latitude && !longitude && !zoom) {
        const zoomCity = zoomLevels[9].id;
        return setPosition(LOCATION_PARIS.lat, LOCATION_PARIS.lng, zoomCity);
      }

      if (refMap.current?.leafletElement) {
        refMap.current.leafletElement.setView([latitude, longitude], zoom);
      }
      getLocationUser(latitude, longitude);
    }
  }, [refMap, zoom, isMapDisplay, latitude, longitude, setPosition]);

  return (
    <Panel id="display-mode">
      <PanelHeader>
        <FormattedMessage id="display.mode" tagName="h4" />
        <a
          href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot#affichage"
          rel="noopener noreferrer"
          target="_blank"
          className="pull-right link">
          <Icon name={ICON_NAME.information} size={16} color={colors.blue} className="mr-5" />
          <FormattedMessage id="global.help" />
        </a>
      </PanelHeader>

      <Panel.Body>
        {errorViewEnabled ? (
          <Error>
            <FormattedMessage id={errorViewEnabled} tagName="p" />
          </Error>
        ) : (
          <FormattedMessage id="select.display.mode" tagName="p" />
        )}

        <Field
          id="list-view"
          name="viewEnabled.isListViewEnabled"
          component={viewChoice}
          hasError={!!errorViewEnabled}
          tooltip={
            stepsList && stepsList.length > 0
              ? {
                  width: '360px',
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="list" />,
                }
              : null
          }
          label={<FormattedMessage id="list.view" />}
          icon={<IconListView className="icon-illustration" />}
        />

        <Field
          id="grid-view"
          name="viewEnabled.isGridViewEnabled"
          component={viewChoice}
          hasError={!!errorViewEnabled}
          tooltip={
            stepsGrid && stepsGrid.length > 0
              ? {
                  width: '360px',
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="grid" />,
                }
              : null
          }
          label={<FormattedMessage id="grid.view" />}
          icon={<IconGridView className="icon-illustration" />}
        />

        <Field
          id="map-view"
          name="viewEnabled.isMapViewEnabled"
          component={viewChoice}
          hasError={!!errorViewEnabled}
          isOpen={isMapViewEnabled}
          onChange={(e, isChecked) => dispatch(change(formName, 'usingAddress', isChecked))}
          tooltip={
            stepsMap && stepsMap.length > 0
              ? {
                  width: '360px',
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="map" />,
                }
              : null
          }
          label={
            <>
              <div>
                <FormattedMessage id="map.view" />

                {isMapViewEnabled && (
                  <FormattedMessage
                    id="map.configuration.zone.longitude.latitude.zoom"
                    values={{ zone: city, latitude: position[0], longitude: position[1], zoom }}
                  />
                )}
              </div>

              {isMapViewEnabled && (
                <ButtonToggleView
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    setIsOpen(!isOpen);
                  }}>
                  <Icon
                    name={isOpen ? ICON_NAME.chevronUp : ICON_NAME.chevronDown}
                    size={14}
                    color={colors.blue}
                  />
                </ButtonToggleView>
              )}
            </>
          }
          icon={<IconMapView className="icon-illustration" />}>
          {isMapDisplay && (
            <MapViewContent>
              <FormattedMessage id="initial-position-of-the-map" tagName="h5" />

              <MapContainer>
                <Map
                  ref={refMap}
                  className="map"
                  center={position}
                  zoom={zoom || 10}
                  zoomControl={false}
                  style={{
                    zIndex: 1,
                  }}>
                  <SearchAddress getPosition={setPosition} address={address} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
                    url={`https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
                  />
                  <ZoomControl position="bottomright" />
                  <Marker
                    position={position}
                    icon={L.icon({
                      iconUrl: '/svg/marker.svg',
                      iconSize: [30, 30],
                      iconAnchor: [20, 40],
                    })}
                  />
                </Map>

                <div className="fields">
                  <Field
                    type="text"
                    name="latMap"
                    id="latitude"
                    component={component}
                    label={<FormattedMessage id="admin.fields.proposal_form.latitude" />}
                  />

                  <Field
                    type="text"
                    name="lngMap"
                    id="longitude"
                    component={component}
                    label={<FormattedMessage id="admin.fields.proposal_form.longitude" />}
                  />

                  <Field
                    type="select"
                    name="zoomMap"
                    id="zoom"
                    component={component}
                    normalize={val => parseInt(val, 10)}
                    label={<FormattedMessage id="proposal_form.zoom" />}>
                    {zoomLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {`${level.id} ${
                          level.name ? `- ${intl.formatMessage({ id: level.name })}` : ''
                        }`}
                      </option>
                    ))}
                  </Field>
                </div>
              </MapContainer>
            </MapViewContent>
          )}
        </Field>
      </Panel.Body>
    </Panel>
  );
};

const mapStateToProps = state => ({
  latitude: formSelector(state, 'latMap'),
  longitude: formSelector(state, 'lngMap'),
  zoom: formSelector(state, 'zoomMap'),
  isMapViewEnabled: formSelector(state, 'viewEnabled')?.isMapViewEnabled,
  errorViewEnabled: getFormSyncErrors(formName)(state)?.viewEnabled,
});

const SectionDisplayModeConnected = connect(mapStateToProps)(SectionDisplayMode);

export default createFragmentContainer(SectionDisplayModeConnected, {
  proposalForm: graphql`
    fragment SectionDisplayMode_proposalForm on ProposalForm {
      ...PopoverToggleView_proposalForm
      step {
        project {
          firstCollectStep {
            form {
              isGridViewEnabled
              isListViewEnabled
              isMapViewEnabled
            }
          }
          steps {
            __typename
            ... on CollectStep {
              mainView
              form {
                isGridViewEnabled
                isListViewEnabled
                isMapViewEnabled
              }
            }
            ... on SelectionStep {
              mainView
            }
          }
        }
      }
    }
  `,
});
