import React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { MapContainer, Marker } from 'react-leaflet'
import { GestureHandling } from 'leaflet-gesture-handling'
import { Box, Skeleton } from '@cap-collectif/ui'
import colors from '~/utils/colors'
import config from '~/config'
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import type { ProposalPageLocalisation_proposal } from '~relay/ProposalPageLocalisation_proposal.graphql'
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style'

type Props = {
  proposal: ProposalPageLocalisation_proposal | null | undefined
}
let L

const Placeholder = () => (
  <Box ml={4}>
    <Skeleton.Text width="100%" size="sm" mb={4} />
    <Skeleton.Text width="100%" height="130px" />
  </Box>
)

export const ProposalPageLocalisation = ({ proposal }: Props) => {
  React.useEffect(() => {
    if (config.canUseDOM) {
      L = require('leaflet')

      L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
    }
  }, [])

  if (!proposal || !config.canUseDOM || !proposal.address || !proposal.form.usingAddress) {
    return null
  }

  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon>
            <Icon name={ICON_NAME.pin} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <FormattedMessage id="form.label_neighborhood" tagName="h3" />
        </CategoryTitle>
        <Skeleton placeholder={<Placeholder />} isLoaded={proposal !== null}>
          {proposal?.address && config.canUseDOM ? (
            <div className="proposal-map__block">
              <p>{proposal?.address.formatted}</p>
              <MapContainer
                center={{
                  lat: proposal?.address.lat,
                  lng: proposal?.address.lng,
                }}
                zoom={16}
                maxZoom={MAX_MAP_ZOOM}
                style={{
                  width: '100%',
                  height: 175,
                }}
                doubleClickZoom={false}
                gestureHandling
              >
                <CapcoTileLayer />
                <Marker
                  position={[proposal?.address.lat, proposal?.address.lng]}
                  icon={
                    L &&
                    L.icon({
                      iconUrl: '/svg/marker.svg',
                      iconSize: [40, 40],
                      iconAnchor: [20, 40],
                      popupAnchor: [0, -40],
                    })
                  }
                />
              </MapContainer>
            </div>
          ) : null}
        </Skeleton>
      </CategoryContainer>
    </Card>
  )
}
export default createFragmentContainer(ProposalPageLocalisation, {
  proposal: graphql`
    fragment ProposalPageLocalisation_proposal on Proposal {
      id
      form {
        usingAddress
      }
      address {
        formatted
        lat
        lng
      }
    }
  `,
})
