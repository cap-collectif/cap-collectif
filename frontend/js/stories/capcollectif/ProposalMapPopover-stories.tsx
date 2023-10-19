// @ts-nocheck
import * as React from 'react'
import L from 'leaflet'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { storiesOf } from '@storybook/react'
import { MapContainer, Marker } from 'react-leaflet'
import { BlankPopup } from '~/components/Proposal/Map/ProposalLeafletMap.style'
import { PopoverContent, PopoverContainer, Status, PopoverInfo } from '~/components/Proposal/Map/ProposalMapPopover'
import { proposal as proposalMock } from '../mocks/proposal'
import { UserLink } from '~/components/User/UserLink'
import type { FeatureToggles } from '~/types'
import { features as defaultFeatures } from '~/redux/modules/default'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import colors from '~/utils/colors'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import Image from '~ui/Primitives/Image'
// TODO: mieux typer l'ensemble du storybook
type Props = {
  proposal: Record<string, any>
  features: FeatureToggles
}
export const ProposalMapPopover = (props: Props) => {
  const { proposal, features } = props
  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
  }, [])
  return (
    <React.Fragment>
      <MapContainer
        center={{
          lat: 48.8586047,
          lng: 2.3137325,
        }}
        zoom={12}
        maxZoom={18}
        className="zi-0"
        style={{
          width: '500px',
          height: '500px',
          margin: 'auto',
        }}
        doubleClickZoom={false}
        gestureHandling
      >
        <CapcoTileLayer />
        <Marker
          position={[proposal.address && proposal.address.lat, proposal.address && proposal.address.lng]}
          icon={L.icon({
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          })}
        >
          <BlankPopup closeButton={false}>
            <PopoverContainer>
              {proposal.status && <Status color="#5bc0de">{proposal.status?.name}</Status>}
              <PopoverContent>
                <h4>
                  <a href="/skusku">{proposal.title}</a>
                </h4>
                <div>
                  {features.display_pictures_in_depository_proposals_list && (
                    <Image src={proposal.media.url} alt="proposal-illustration" />
                  )}
                  <div>
                    {proposal.category && (
                      <PopoverInfo>
                        <Icon name={ICON_NAME.tag} size={12} color={colors.iconGrayColor} />
                        <span>{proposal.category.name}</span>
                      </PopoverInfo>
                    )}
                    <PopoverInfo>
                      <Icon name={ICON_NAME.newUser} size={12} color={colors.iconGrayColor} />
                      <UserLink user={proposal.author} toggled={false} />
                    </PopoverInfo>
                  </div>
                </div>
              </PopoverContent>
            </PopoverContainer>
          </BlankPopup>
        </Marker>
      </MapContainer>
    </React.Fragment>
  )
}
const info = {
  info: {
    text: `
        <p>Click on the marker to see the Popover</p>
      `,
  },
}
storiesOf('Cap Collectif/ProposalMapPopover', module)
  .add(
    'default case',
    () => {
      return <ProposalMapPopover proposal={proposalMock} features={defaultFeatures} />
    },
    info,
  )
  .add(
    'with a proposal with media',
    () => {
      return (
        <ProposalMapPopover
          proposal={proposalMock}
          features={{ ...defaultFeatures, display_pictures_in_depository_proposals_list: true }}
        />
      )
    },
    info,
  )
