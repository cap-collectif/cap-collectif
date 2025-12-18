import {
  Box,
  CapUIIcon,
  CapUIIconSize,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  Icon,
  useTheme,
} from '@cap-collectif/ui'
import { FC, useMemo, useRef } from 'react'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import { renderToString } from 'react-dom/server'
import convertIconToDs from '@shared/utils/convertIconToDs'
import useIsMobile from '@shared/hooks/useIsMobile'
import { graphql, useFragment } from 'react-relay'
import { ProposalMarker_proposal$key } from '@relay/ProposalMarker_proposal.graphql'

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalMarker_proposal on Proposal {
    id
    title
    url
    address {
      lat
      lng
    }
    category {
      color
      icon
      categoryImage {
        image {
          url
        }
      }
    }
    media {
      url
    }
  }
`

type ProposalMarkerProps = {
  proposal: ProposalMarker_proposal$key
}

const ProposalMarker: FC<ProposalMarkerProps> = ({ proposal: proposalKey }) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalKey)
  const { colors } = useTheme()
  const isMobile = useIsMobile()

  if (!proposal || !proposal.address?.lat || !proposal.address?.lng) return null

  const updateSelectedId = (id: string | null) => {
    window.dispatchEvent(new CustomEvent('proposal-selected', { detail: id }))
  }

  const icon = proposal.category?.icon
  const iconSize = 30
  const proposalCover = proposal.media?.url || proposal.category?.categoryImage?.image?.url

  const markerRef = useRef<L.Marker>(null)

  const markerIcon = useMemo(() => {
    return L.divIcon({
      className: 'preview-icn',
      html: renderToString(
        <>
          <Icon
            name={icon ? CapUIIcon.PinFull : CapUIIcon.Pin}
            size={CapUIIconSize.Sm}
            color={proposal.category?.color || colors['neutral-gray'].darker}
          />
          {icon && <Icon name={convertIconToDs(icon)} size={CapUIIconSize.Xs} color="white" />}
        </>,
      ),
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize],
      popupAnchor: [0, -iconSize - 2],
    })
  }, [icon, proposal.category?.color, colors])

  return (
    <Marker
      ref={markerRef}
      position={[proposal.address.lat, proposal.address.lng]}
      icon={markerIcon}
      eventHandlers={{
        popupopen: () => {
          markerRef.current?.getElement()?.classList.add('active')
          updateSelectedId(proposal.id)
        },
        popupclose: () => {
          markerRef.current?.getElement()?.classList.remove('active')
          updateSelectedId(null)
        },
        mouseover: () => {
          markerRef.current?.getElement()?.classList.add('active')
        },
        mouseout: () => {
          if (markerRef.current?.getPopup().isOpen()) return
          markerRef.current?.getElement()?.classList.remove('active')
        },
      }}
    >
      {isMobile ? (
        <Box position="absolute" left="0" bottom="md" width="100%" px="md" zIndex={9999}>
          <Card format="horizontal">
            <CardCover>
              {proposalCover ? (
                <CardCoverImage src={proposalCover} />
              ) : (
                <CardCoverPlaceholder
                  icon={icon ? convertIconToDs(icon) : CapUIIcon.BubbleO}
                  color={proposal.category?.color || 'primary.base'}
                />
              )}
            </CardCover>
            <CardContent primaryInfo={proposal.title} href={proposal.url} />
          </Card>
        </Box>
      ) : (
        <Popup className="leaflet-card-popup">
          <Card format="horizontal">
            <CardCover>
              {proposalCover ? (
                <CardCoverImage src={proposalCover} />
              ) : (
                <CardCoverPlaceholder
                  icon={icon ? convertIconToDs(icon) : CapUIIcon.BubbleO}
                  color={proposal.category?.color || 'primary.base'}
                />
              )}
            </CardCover>
            <CardContent primaryInfo={proposal.title} href={proposal.url} />
          </Card>
        </Popup>
      )}
    </Marker>
  )
}

export default ProposalMarker
