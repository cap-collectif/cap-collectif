import * as React from 'react'
import { useIntl } from 'react-intl'
import { change, formValueSelector } from 'redux-form'
import noop from 'lodash/noop'
import { renderToString } from 'react-dom/server'
import { useDispatch, connect } from 'react-redux'
import { graphql, useFragment } from 'react-relay'
import { MapContainer, Marker, GeoJSON, ZoomControl, useMapEvents } from 'react-leaflet'
import { Flex, Button, Modal, Box, CapUIIcon } from '@cap-collectif/ui'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import { formName, retrieveDistrictForLocation } from '../Form/ProposalForm'
import type { Dispatch, GlobalState } from '~/types'
import type { ProposalChangeAddressModal_proposalForm$key } from '~relay/ProposalChangeAddressModal_proposalForm.graphql'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import 'leaflet/dist/leaflet.css'
import { colors as dsColors } from '~/styles/modules/colors'
import { colors } from '~/utils/colors'
import config from '~/config'
import AddressBar from '~/components/Form/Address/Address'
import { geoContains, formatGeoJsons, convertToGeoJsonStyle } from '~/utils/geojson'
import { getAddressFromLatLng } from '~/utils/googleMapAddress'
import ProposalMapDiscoverPane from '../Map/ProposalMapDiscoverPane'
import ProposalMapOutOfAreaPane from '../Map/ProposalMapOutOfAreaPane'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import { mapToast } from '../Map/Map.events'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
let L
type OwnProps = {
  readonly onClose: () => void
  readonly resetModalState: () => void
  readonly proposalForm: ProposalChangeAddressModal_proposalForm$key
}
type StateProps = {
  readonly addressValue: string | null | undefined
  readonly category: string | null | undefined
  readonly dispatch: Dispatch
}
type Props = OwnProps & StateProps
const FRAGMENT = graphql`
  fragment ProposalChangeAddressModal_proposalForm on ProposalForm {
    id
    proposalInAZoneRequired
    mapCenter {
      lat
      lng
    }
    categories(order: ALPHABETICAL) {
      id
      name
      color
      icon
    }
    step {
      form {
        districts(order: ALPHABETICAL) {
          displayedOnMap
          geojson
          id
          border {
            id
            enabled
            color
            opacity
            size
          }
          background {
            id
            enabled
            color
            opacity
            size
          }
        }
      }
    }
  }
`
export const flyToPosition = (map: L.Map, lat: number, lng: number) => {
  if (map) map.flyTo([lat, lng], 18)
}

const MapCustomEvents = ({
  hideDiscoverPane,
  onClick,
}: {
  hideDiscoverPane: () => void
  onClick: (e: L.LeafletMouseEvent) => void
}) => {
  useMapEvents({
    zoomstart: () => hideDiscoverPane(),
    click: e => onClick(e),
  })

  return null
}

const ProposalChangeAddressModal = ({
  resetModalState,
  proposalForm: proposalFormFragment,
  addressValue,
  category,
}: Props): JSX.Element => {
  const proposalForm = useFragment(FRAGMENT, proposalFormFragment) // @ts-ignore relay fragment
  const geoJsons = proposalForm.step?.form?.districts ? formatGeoJsons(proposalForm.step.form.districts) : null
  const [mapRef, setMapRef] = React.useState(null)
  const intl = useIntl()
  const dispatch: Dispatch = useDispatch()
  const [showDiscoverPane, setShowDiscoverPane] = React.useState(!addressValue)

  if (config.canUseDOM) {
    L = require('leaflet')
  }

  const [newAddress, setNewAddress] = React.useState<AddressComplete | null | undefined>(
    JSON.parse(addressValue ? addressValue.substring(1, addressValue.length - 1) : '{}'),
  )
  const [newAddressBar, setNewAddressBar] = React.useState<string | null | undefined>(
    newAddress?.formatted_address || null,
  )
  if (!L) return null
  const proposalCategory = proposalForm.categories.find(cat => cat.id === category) || {
    color: dsColors.blue[500],
    icon: null,
  }
  return (
    <>
      <Modal.Body>
        <Box
          position="relative"
          css={{
            '.address-container': {
              position: 'absolute',
              top: 10,
              left: 10,
              right: 'initial',
              zIndex: 1001,
              width: L?.Browser?.mobile ? 'calc(100% - 20px)' : '66%',
              maxWidth: 480,
            },
          }}
        >
          <AddressBar
            id="address"
            getPosition={(lat, lng) => {
              if (
                proposalForm.proposalInAZoneRequired &&
                !geoContains(geoJsons || [], {
                  lat,
                  lng,
                })
              ) {
                mapToast()
              } else flyToPosition(mapRef, lat, lng)
            }}
            getAddress={(addr: AddressComplete | null | undefined) => {
              if (addr) {
                if (proposalForm.proposalInAZoneRequired && !geoContains(geoJsons || [], addr.geometry.location)) {
                  mapToast()
                  setNewAddressBar(newAddress?.formatted_address || '')
                } else {
                  setNewAddress(addr)
                  flyToPosition(mapRef, addr.geometry.location.lat, addr.geometry.location.lng)
                }
              } else noop()
            }}
            debounce={1200}
            value={newAddressBar}
            onChange={setNewAddressBar}
            placeholder={intl.formatMessage({
              id: 'proposal.map.form.placeholder',
            })}
          />
          <MapContainer
            doubleClickZoom={false}
            dragging
            touchZoom
            scrollWheelZoom={false}
            zoom={16}
            zoomControl={false}
            center={
              newAddress?.geometry?.location || {
                lat: proposalForm.mapCenter?.lat || 48.8586047,
                lng: proposalForm.mapCenter?.lng || 2.3137325,
              }
            }
            maxZoom={MAX_MAP_ZOOM}
            css={{
              width: '100%',
              height: '100%',
              minHeight: L.Browser.mobile ? 'calc(100vh - 100px)' : '550px',
              '.leaflet-bottom.leaflet-left': {
                left: '50%',
                transform: 'translate(-50%, 0%)',
              },
              '.leaflet-top.leaflet-right': L.Browser.mobile
                ? {
                    right: '50%',
                    top: '50%',
                    transform: 'translate(50%, -50%)',
                  }
                : {},
            }}
            tap
            ref={setMapRef}
          >
            <MapCustomEvents
              hideDiscoverPane={() => setShowDiscoverPane(false)}
              onClick={async e => {
                if (e?.latlng) {
                  if (proposalForm.proposalInAZoneRequired && !geoContains(geoJsons || [], e.latlng)) mapToast()
                  else {
                    const geoAddr = await getAddressFromLatLng(e.latlng)
                    setNewAddress(geoAddr)
                    setNewAddressBar(geoAddr.formatted_address)
                  }
                }
              }}
            />
            <CapcoTileLayer />
            {geoJsons &&
              geoJsons.map((geoJson, idx) => (
                <GeoJSON style={convertToGeoJsonStyle(geoJson.style)} key={idx} data={geoJson.district} />
              ))}
            {newAddress?.formatted_address && (
              <Marker
                position={[newAddress.geometry.location.lat, newAddress.geometry.location.lng]}
                icon={L.divIcon({
                  className: 'preview-icn',
                  html: renderToString(
                    <>
                      <Icon name={ICON_NAME.pin3} size={40} color={proposalCategory.color} />
                      {proposalCategory.icon && (
                        <Icon
                          name={ICON_NAME[proposalCategory.icon]}
                          size={16}
                          color={colors.white}
                          style={{
                            position: 'absolute',
                            top: 7,
                            left: 12,
                          }}
                        />
                      )}
                    </>,
                  ),
                  iconSize: [34, 48],
                  iconAnchor: [17, 24],
                })}
              />
            )}
            <ProposalMapDiscoverPane
              type="SELECT"
              show={showDiscoverPane}
              handleClose={() => setShowDiscoverPane(false)}
            />
            <ProposalMapOutOfAreaPane
              content={intl.formatHTMLMessage({
                id: 'constraints.address_in_zone',
              })}
            />
            {!L.Browser.mobile && <ZoomControl position="bottomright" />}
          </MapContainer>
        </Box>
      </Modal.Body>
      <Modal.Footer>
        <Flex justifyContent="space-between" width="100%">
          <Button leftIcon={CapUIIcon.LongArrowLeft} variant="link" variantColor="primary" onClick={resetModalState}>
            {intl.formatMessage({
              id: 'global.back',
            })}
          </Button>
          <Button
            disabled={!newAddress?.formatted_address}
            variantSize="big"
            variant="primary"
            variantColor="primary"
            onClick={() => {
              dispatch(change(formName, 'address', newAddress ? JSON.stringify([newAddress]) : newAddress))
              dispatch(change(formName, 'addressText', newAddress ? newAddress.formatted_address : newAddress))
              if (newAddress && proposalForm.proposalInAZoneRequired)
                retrieveDistrictForLocation(newAddress.geometry.location, proposalForm.id, dispatch)
              resetModalState()
            }}
          >
            {intl.formatMessage({
              id: 'validate-address',
            })}
          </Button>
        </Flex>
      </Modal.Footer>
    </>
  )
}

const selector = formValueSelector(formName)

const mapStateToProps = (state: GlobalState) => ({
  addressValue: selector(state, 'address'),
  category: selector(state, 'category'),
})

export default connect(mapStateToProps)(ProposalChangeAddressModal)
