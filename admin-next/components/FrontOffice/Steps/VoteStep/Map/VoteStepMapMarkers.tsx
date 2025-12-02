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
import { FC, useEffect } from 'react'
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

import { renderToString } from 'react-dom/server'
import convertIconToDs from '@shared/utils/convertIconToDs'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { graphql, usePaginationFragment } from 'react-relay'
import { VoteStepMapMarkers_proposalStep$key } from '@relay/VoteStepMapMarkers_proposalStep.graphql'
import { parseAsInteger, useQueryState } from 'nuqs'

export const mapId = 'cap-vote-step-map'
export const MAX_MAP_ZOOM = 18

type Props = { step: VoteStepMapMarkers_proposalStep$key }

const MARKERS_FRAGMENT = graphql`
  fragment VoteStepMapMarkers_proposalStep on ProposalStep
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    orderBy: { type: "[ProposalOrder]" }
    userType: { type: "ID" }
    theme: { type: "ID" }
    category: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    geoBoundingBox: { type: "GeoBoundingBox" }
    term: { type: "String" }
    # stepId: { type: "ID!" }
    # isAuthenticated: { type: "Boolean!" }
  )
  @refetchable(queryName: "VoteStepMapMarkersQuery") {
    entity: proposals(
      first: $count
      after: $cursor
      orderBy: $orderBy
      userType: $userType
      theme: $theme
      category: $category
      district: $district
      status: $status
      geoBoundingBox: $geoBoundingBox
      term: $term
    )
      @connection(
        key: "VoteStepMapMarkers_entity"
        filters: ["term", "orderBy", "userType", "theme", "category", "district", "status", "geoBoundingBox"]
      ) {
      edges {
        node {
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
      }
    }
  }
`

const VoteStepMapMarkers: FC<Props> = ({ step: stepKey }) => {
  const { colors } = useTheme()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(MARKERS_FRAGMENT, stepKey)
  const [isMapExpanded] = useQueryState('map_expanded', parseAsInteger)

  useEffect(() => {
    if (hasNext) loadNext(50)
  }, [hasNext, isLoadingNext, loadNext])

  const markers =
    data.entity.edges
      ?.map(edge => edge?.node)
      .filter(mark => !!(mark?.address && mark.address.lat && mark.address.lng)) || []

  if (!markers?.length) return null

  return (
    <MarkerClusterGroup
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      zoomToBoundsOnClick
      spiderfyDistanceMultiplier={4}
      maxClusterRadius={30}
    >
      {markers.map(mark => {
        const icon = mark.category?.icon
        //const isSelected = selectedProposal === mark.id
        const isActive = false //isSelected || hoveredProposal === mark.id
        const iconSize = 50

        const proposalCover = mark.media?.url || mark.category?.categoryImage?.image?.url

        return (
          <Marker
            key={mark.id}
            position={[mark.address?.lat, mark.address?.lng]}
            icon={L.divIcon({
              className: `preview-icn ${isActive ? 'active' : ''}`,
              html: renderToString(
                <>
                  <Icon
                    name={icon ? CapUIIcon.PinFull : CapUIIcon.Pin}
                    size={CapUIIconSize.Sm}
                    color={mark.category?.color || colors['neutral-gray']['darker']}
                  />
                  {icon && <Icon name={convertIconToDs(icon)} size={CapUIIconSize.Xs} color="white" />}
                </>,
              ),

              iconSize: [iconSize, iconSize],
              iconAnchor: [iconSize / 2, iconSize],
              popupAnchor: [-10, -iconSize],
            })}
            // eventHandlers={{
            //   click: () => {
            //     // if (isMobile) setSelectedProposal(isSelected ? null : mark.id)
            //     if (!isMobile)
            //       dispatchEvent(VoteStepEvent.ClickProposal, {
            //         id: mark.id,
            //       })
            //   },
            // }}
          >
            {isMapExpanded ? (
              <Popup>
                <Card format="horizontal">
                  <CardCover>
                    {proposalCover ? (
                      <CardCoverImage /*{...getSrcSet(proposalCover)}*/ src={proposalCover} />
                    ) : (
                      <CardCoverPlaceholder
                        icon={icon ? convertIconToDs(icon) : CapUIIcon.BubbleO}
                        color={mark.category?.color || 'primary.base'}
                      />
                    )}
                  </CardCover>
                  <CardContent primaryInfo={mark.title} href={mark.url} />
                </Card>
              </Popup>
            ) : null}
          </Marker>
        )
      })}
    </MarkerClusterGroup>
  )
}

export default VoteStepMapMarkers
