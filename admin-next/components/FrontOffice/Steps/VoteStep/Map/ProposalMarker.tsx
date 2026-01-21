import {
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
import { FC, memo, useEffect, useMemo, useRef } from 'react'
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

const ProposalMarkerComponent: FC<ProposalMarkerProps> = ({ proposal: proposalKey }) => {
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalKey)
  const { colors } = useTheme()
  const isMobile = useIsMobile()

  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    if (isMobile) return
    const handler = (e: CustomEvent<string | null>) => {
      if (markerRef.current?.getPopup()?.isOpen()) return
      const iconElement = markerRef.current?.getElement()
      if (e.detail === proposal.id) {
        iconElement?.classList.add('active')
      } else {
        iconElement?.classList.remove('active')
      }
    }
    window.addEventListener('proposal-card-hover', handler as EventListener)
    return () => window.removeEventListener('proposal-card-hover', handler as EventListener)
  }, [proposal.id])

  const icon = proposal.category?.icon
  const iconSize = 30
  const proposalCover = proposal.media?.url || proposal.category?.categoryImage?.image?.url

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

  if (!proposal || !proposal.address?.lat || !proposal.address?.lng) return null

  return (
    <Marker
      ref={markerRef}
      position={[proposal.address.lat, proposal.address.lng]}
      icon={markerIcon}
      eventHandlers={{
        popupopen: () => {
          markerRef.current?.getElement()?.classList.add('active')
          window.dispatchEvent(new CustomEvent('proposal-selected', { detail: proposal.id }))
        },
        popupclose: () => {
          markerRef.current?.getElement()?.classList.remove('active')
          window.dispatchEvent(new CustomEvent('proposal-selected', { detail: null }))
        },
        mouseover: () => {
          markerRef.current?.getElement()?.classList.add('active')
          window.dispatchEvent(new CustomEvent('proposal-selected', { detail: proposal.id }))
        },
        mouseout: () => {
          if (markerRef.current?.getPopup()?.isOpen()) return
          markerRef.current?.getElement()?.classList.remove('active')
          window.dispatchEvent(new CustomEvent('proposal-selected', { detail: null }))
        },
      }}
    >
      {!isMobile && (
        <Popup className="leaflet-card-popup">
          <Card format="horizontal" maxHeight="83px">
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

const ProposalMarker = memo(ProposalMarkerComponent)

export default ProposalMarker
