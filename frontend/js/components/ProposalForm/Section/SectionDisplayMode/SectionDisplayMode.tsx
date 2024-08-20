import * as React from 'react'
import { change, Field, getFormSyncErrors, formValueSelector } from 'redux-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay'
import { Panel } from 'react-bootstrap'
import L from 'leaflet'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { MapContainer as Map, Marker, ZoomControl } from 'react-leaflet'
import type { Dispatch, GlobalState } from '~/types'
import viewChoice from './ViewChoice/ViewChoice'
import { PanelHeader, MapViewContent, MapContainer, ButtonToggleView, Error } from './SectionDisplayMode.style'
import IconMapView from '~svg/map_view.svg'
import IconGridView from '~svg/grid_view.svg'
import IconListView from '~svg/list_view.svg'
import component from '~/components/Form/Field'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import PopoverToggleView from './PopoverToggleView/PopoverToggleView'
import environment from '~/createRelayEnvironment'
import { formatAddressFromGoogleAddress, getDataFromGoogleAddress } from '~/utils/googleMapAddress'
import type { SectionDisplayMode_proposalForm$data } from '~relay/SectionDisplayMode_proposalForm.graphql'
import type { SectionDisplayMode_GeoCodeQueryQuery$data } from '~relay/SectionDisplayMode_GeoCodeQueryQuery.graphql'
import type { AddressType, AddressCompleteFormatted, AddressComplete } from '~/components/Form/Address/Address.type'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
export const LOCATION_PARIS = {
  lat: 48.8534,
  lng: 2.3488,
}
export const ZOOM_CITY = 9
export const zoomLevels = [
  {
    id: 1,
    name: 'map.zoom.world',
  },
  {
    id: 2,
  },
  {
    id: 3,
  },
  {
    id: 4,
  },
  {
    id: 5,
    name: 'map.zoom.mainland',
  },
  {
    id: 6,
  },
  {
    id: 7,
  },
  {
    id: 8,
  },
  {
    id: 9,
  },
  {
    id: 10,
    name: 'map.zoom.city',
  },
  {
    id: 11,
  },
  {
    id: 12,
  },
  {
    id: 13,
  },
  {
    id: 14,
  },
  {
    id: 15,
    name: 'map.zoom.street',
  },
  {
    id: 16,
  },
  {
    id: 17,
  },
  {
    id: 18,
    name: 'map.zoom.building',
  },
]

const getStepsDependOfView = (
  proposalForm: SectionDisplayMode_proposalForm$data,
  viewSearched: 'GRID' | 'LIST' | 'MAP',
) => {
  const firstCollectStep = proposalForm.step?.project?.firstCollectStep
  return proposalForm.step?.project?.steps.filter(Boolean).filter(step => {
    if (step.__typename === 'CollectStep') {
      if (step.mainView === 'GRID' && step.form?.isGridViewEnabled && viewSearched === 'GRID') return true
      if (step.mainView === 'LIST' && step.form?.isListViewEnabled && viewSearched === 'LIST') return true
      if (step.mainView === 'MAP' && step.form?.isMapViewEnabled && viewSearched === 'MAP') return true
    }

    if (step.__typename === 'SelectionStep') {
      if (step.mainView === 'GRID' && firstCollectStep?.form?.isGridViewEnabled && viewSearched === 'GRID') {
        return true
      }

      if (step.mainView === 'LIST' && firstCollectStep?.form?.isListViewEnabled && viewSearched === 'LIST') {
        return true
      }

      if (step.mainView === 'MAP' && firstCollectStep?.form?.isMapViewEnabled && viewSearched === 'MAP') {
        return true
      }
    }
  })
}

const getZoomDependOfAddress = (addressType?: AddressType) => {
  switch (addressType) {
    case 'continent':
    case 'country':
      return zoomLevels[4]

    case 'route':
    case 'street_address':
      return zoomLevels[14]

    case 'locality':
    default:
      return zoomLevels[ZOOM_CITY]
  }
}

type Props = {
  dispatch: Dispatch
  latitude: number
  longitude: number
  zoom?: number
  isMapViewEnabled: boolean
  proposalForm: SectionDisplayMode_proposalForm$data
  errorViewEnabled: string | null | undefined
  dataMap: {
    json: string
    lat: number
    lng: number
  }
  formName: string
}
const USER_LOCATION_QUERY = graphql`
  query SectionDisplayMode_GeoCodeQueryQuery($latitude: Float!, $longitude: Float!) {
    results: geocode(latitude: $latitude, longitude: $longitude) {
      json
    }
  }
`
export const loadLocationUser = (
  latitude: number,
  longitude: number,
): Promise<{
  readonly json: string
}> =>
  new Promise(async resolve => {
    const response: SectionDisplayMode_GeoCodeQueryQuery$data = await fetchQuery_DEPRECATED(
      environment as any,
      USER_LOCATION_QUERY,
      {
        latitude,
        longitude,
      },
    )
    resolve(
      response.results as any as {
        readonly json: string
      },
    )
  })
export const SectionDisplayMode = ({
  latitude,
  longitude,
  zoom,
  dispatch,
  isMapViewEnabled,
  proposalForm,
  errorViewEnabled,
  dataMap,
  formName,
}: Props) => {
  const intl = useIntl()
  const [isOpen, setIsOpen] = React.useState(true)
  const [previewLocation, setPreviewLocation] = React.useState(null)
  const [addressSelected, setAddressSelected] = React.useState<AddressComplete | null | undefined>(null)
  const refMap = React.useRef(null)
  const isMapDisplay = isMapViewEnabled && isOpen
  const position = [latitude || LOCATION_PARIS.lat, longitude || LOCATION_PARIS.lng]
  const stepsGrid = getStepsDependOfView(proposalForm, 'GRID')
  const stepsList = getStepsDependOfView(proposalForm, 'LIST')
  const stepsMap = getStepsDependOfView(proposalForm, 'MAP')
  const updateInfoLocation = React.useCallback(
    (dataLocation: AddressCompleteFormatted, previewLocationDisplay: string) => {
      if (previewLocationDisplay) setPreviewLocation(previewLocationDisplay)
      dispatch(change(formName, 'address', dataLocation.address))
    },
    [dispatch, formName],
  )
  const setPosition = React.useCallback(
    (
      lat: number,
      lng: number,
      zoomId: number,
      dataLocation: AddressCompleteFormatted,
      previewLocationDisplay?: string,
    ) => {
      if (dataLocation && previewLocationDisplay) {
        updateInfoLocation(dataLocation, previewLocationDisplay)
      }

      dispatch(change(formName, 'mapCenter.lat', lat))
      dispatch(change(formName, 'mapCenter.lng', lng))
      dispatch(change(formName, 'mapCenter.json', dataLocation.addressOriginal))
      dispatch(change(formName, 'zoomMap', zoomId))

      if (refMap.current) {
        refMap.current.setView([lat, lng], zoomId)
      }
    },
    [dispatch, updateInfoLocation, formName],
  )
  const getLocationUser = React.useCallback(
    async (lat: number, lng: number, zoomId?: number) => {
      const zoomBuilding = zoomLevels[zoomLevels.length - 1]
      const zoomValue = zoomId || zoomBuilding.id
      const addressLocationUser = await loadLocationUser(lat, lng)
      const userAddressFormatted = formatAddressFromGoogleAddress(JSON.parse(addressLocationUser.json)[0])
      const city = getDataFromGoogleAddress(userAddressFormatted, 'locality')
      setPosition(lat, lng, zoomValue, userAddressFormatted, city)
    },
    [setPosition],
  )

  const setAddress = (address: AddressComplete) => setAddressSelected(address)

  React.useEffect(() => {
    if (isMapDisplay && refMap && proposalForm) {
      // default position if no one
      if (!latitude || !longitude || !zoom) {
        const zoomCity = zoomLevels[ZOOM_CITY].id
        getLocationUser(LOCATION_PARIS.lat, LOCATION_PARIS.lng, zoomCity)
      } else if (!previewLocation) {
        const addressFormatted = formatAddressFromGoogleAddress(JSON.parse(dataMap.json)[0])

        // case we don't have address
        if (!addressFormatted.address_components || !addressFormatted.type) {
          getLocationUser(addressFormatted.latLng.lat, addressFormatted.latLng.lng, zoomLevels[ZOOM_CITY].id)
        } else {
          const zoomLevel = zoom
            ? {
                id: zoom,
              }
            : getZoomDependOfAddress(addressFormatted.type)
          const previewLocationDisplay = getDataFromGoogleAddress(addressFormatted, addressFormatted.type || 'locality')
          setPosition(
            addressFormatted.latLng.lat,
            addressFormatted.latLng.lng,
            zoomLevel.id,
            addressFormatted,
            previewLocationDisplay,
          )
        }
      }
    }
  }, [
    refMap,
    zoom,
    isMapDisplay,
    latitude,
    longitude,
    setPosition,
    updateInfoLocation,
    dataMap,
    previewLocation,
    getLocationUser,
    proposalForm,
  ])
  React.useEffect(() => {
    if (addressSelected) {
      const addressFormatted = formatAddressFromGoogleAddress(addressSelected)
      const zoomLevel = getZoomDependOfAddress(addressFormatted.type)
      const previewLocationDisplay = getDataFromGoogleAddress(addressFormatted, addressFormatted.type)
      setPosition(
        addressFormatted.latLng.lat,
        addressFormatted.latLng.lng,
        zoomLevel.id,
        addressFormatted,
        previewLocationDisplay,
      )
    }
  }, [addressSelected, setPosition])
  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)

    if (refMap.current) {
      refMap.current.setZoom(zoom)
    }
  }, [zoom, refMap])
  return (
    <Panel id="display-mode">
      <PanelHeader>
        <FormattedMessage id="display.mode" tagName="h4" />
        <a
          href="https://aide.cap-collectif.com/article/51-creer-un-formulaire-de-depot#affichage"
          rel="noopener noreferrer"
          target="_blank"
          className="pull-right link"
        >
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
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="LIST" />,
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
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="GRID" />,
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
                  content: <PopoverToggleView proposalForm={proposalForm} typeView="MAP" />,
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
                    values={{
                      zone: previewLocation,
                      latitude: position[0],
                      longitude: position[1],
                      zoom,
                    }}
                  />
                )}
              </div>

              {isMapViewEnabled && (
                <ButtonToggleView
                  type="button"
                  onClick={e => {
                    e.preventDefault()
                    setIsOpen(!isOpen)
                  }}
                >
                  <Icon name={isOpen ? ICON_NAME.chevronUp : ICON_NAME.chevronDown} size={14} color={colors.blue} />
                </ButtonToggleView>
              )}
            </>
          }
          icon={<IconMapView className="icon-illustration" />}
        >
          {isMapDisplay && (
            <MapViewContent>
              <FormattedMessage id="initial-position-of-the-map" tagName="h5" />

              <MapContainer>
                <Field
                  type="address"
                  id="address"
                  divClassName="search-address"
                  component={component}
                  name="address"
                  formName={formName}
                  placeholder="proposal.map.form.placeholder"
                  addressProps={{
                    getPosition: getLocationUser,
                    getAddress: setAddress,
                  }}
                  debounce={1200}
                />

                <Map
                  whenCreated={map => {
                    refMap.current = map
                  }}
                  className="map"
                  center={position}
                  zoom={zoom || 10}
                  zoomControl={false}
                  doubleClickZoom={false}
                  gestureHandling
                >
                  <CapcoTileLayer />
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
                    name="mapCenter.lat"
                    id="latitude"
                    component={component}
                    label={<FormattedMessage id="admin.fields.proposal_form.latitude" />}
                  />

                  <Field
                    type="text"
                    name="mapCenter.lng"
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
                    label={<FormattedMessage id="proposal_form.zoom" />}
                  >
                    {zoomLevels.map(level => (
                      <option key={level.id} value={level.id}>
                        {`${level.id} ${
                          level.name
                            ? `- ${intl.formatMessage({
                                id: level.name,
                              })}`
                            : ''
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
  )
}

const mapStateToProps = (state: GlobalState, { formName, proposalForm }: Props) => {
  const formSelector = formValueSelector(formName)
  return {
    latitude: formSelector(state, 'mapCenter')?.lat
      ? formSelector(state, 'mapCenter')?.lat
      : proposalForm?.mapCenter?.lat,
    longitude: formSelector(state, 'mapCenter')?.lng
      ? formSelector(state, 'mapCenter')?.lng
      : proposalForm?.mapCenter?.lng,
    dataMap: formSelector(state, 'mapCenter') ? formSelector(state, 'mapCenter') : proposalForm?.mapCenter,
    zoom: formSelector(state, 'zoomMap') ? formSelector(state, 'zoomMap') : proposalForm.zoomMap,
    isMapViewEnabled: formSelector(state, 'viewEnabled')?.isMapViewEnabled,
    errorViewEnabled: getFormSyncErrors(formName)(state)?.viewEnabled,
  }
}

const SectionDisplayModeConnected = connect(mapStateToProps)(SectionDisplayMode)
export default createFragmentContainer(SectionDisplayModeConnected, {
  proposalForm: graphql`
    fragment SectionDisplayMode_proposalForm on ProposalForm {
      ...PopoverToggleView_proposalForm
      mapCenter {
        lat
        lng
        json
      }
      zoomMap
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
})
