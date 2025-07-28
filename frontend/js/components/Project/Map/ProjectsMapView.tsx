import * as React from 'react'
import L from 'leaflet'
import { useLazyLoadQuery, graphql } from 'react-relay'
import noop from 'lodash/noop'
import { MapContainer as Map, Marker, ZoomControl } from 'react-leaflet'
import { useIntl } from 'react-intl'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { renderToString } from 'react-dom/server'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet/dist/leaflet.css'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'
import { isSafari } from '~/config'
import withColors from '~/components/Utils/withColors'
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer'
import useIsMobile from '~/utils/hooks/useIsMobile'
import { MAX_MAP_ZOOM } from '~/utils/styles/variables'
import { BlankPopup, MapContainer } from '~/components/Proposal/Map/ProposalLeafletMap.style'
import { formatGeoJsons } from '~/utils/geojson'
import typography from '~/styles/theme/typography'
import Address from '~/components/Form/Address/Address'
import type { AddressComplete } from '~/components/Form/Address/Address.type'
import Text from '~/components/Ui/Primitives/Text'
import { flyToPosition } from '~/components/Proposal/Map/ProposalLeafletMap'
import Image from '~ui/Primitives/Image'
import GeoJSONView from './GeoJSONView'
import { CapUIIcon, Flex, Link, Icon, CapUIIconSize } from '@cap-collectif/ui'
import type { ProjectsMapViewQuery } from '~relay/ProjectsMapViewQuery.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import FormattedNumber from '@shared/utils/FormattedNumber'

const QUERY = graphql`
  query ProjectsMapViewQuery {
    homePageProjectsMapSectionConfiguration {
      title
      teaser
      centerLatitude
      centerLongitude
      zoomMap
    }
    projects {
      edges {
        node {
          id
          address {
            lat
            lng
          }
          title
          url
          cover {
            url
          }
          anonymousVotes: votes(anonymous: true) {
            totalCount
          }
          contributions {
            totalCount
          }
          contributors {
            totalCount
          }
          anonymousReplies: contributions(type: REPLY_ANONYMOUS) {
            totalCount
          }
          isExternal
          externalLink
          isContributionsCounterDisplayable
          isParticipantsCounterDisplayable
          externalParticipantsCount
          externalContributionsCount
          archived
        }
      }
    }
    globalDistricts {
      edges {
        node {
          id
          slug
          titleOnMap
          geojson
          displayedOnMap
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

export const formatCounter = (iconName: CapUIIcon, count: number, archived: boolean, label: string) => (
  <Flex direction="row" alignItems="center">
    <Icon size={CapUIIconSize.Md} color={archived ? 'gray.500' : 'gray.700'} mr={1} name={iconName} />
    <Text fontSize={14} color={archived ? 'gray.500' : 'gray.900'} as="div">
      <FormattedNumber number={count} />
      <span className="sr-only">{label}</span>
    </Text>
  </Flex>
)

export const ProjectsMapView = ({
  linkColor,
  linkHoverColor,
  backgroundColor,
}: {
  linkColor: string
  linkHoverColor: string
  backgroundColor: string
}) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<ProjectsMapViewQuery>(QUERY, {})
  const mapRef = React.useRef(null)
  const markerRef = React.useRef(null)
  const [address, setAddress] = React.useState(null)
  const isMobile = useIsMobile()
  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
  }, [])
  const [zoom, setZoom] = React.useState(query?.homePageProjectsMapSectionConfiguration.zoomMap)
  if (!useFeatureFlag('display_map')) return null
  if (!query) return null
  const { homePageProjectsMapSectionConfiguration } = query
  const districts = query?.globalDistricts?.edges?.map(d => d.node)
  const markers = query?.projects?.edges?.map(d => d.node).filter(p => !!(p.address && p.address.lat && p.address.lng))
  if (!markers.length) return null
  const geoJsons = districts ? formatGeoJsons(districts) : null
  return (
    <section id="projectsMap" className="section--custom">
      <div className="container">
        <div className="row">
          <Flex
            direction="column"
            sx={{
              '.leaflet-interactive': {
                strokeDasharray: 10,
              },
              '.titleTooltip': {
                opacity: '1 !important',
                fontFamily: typography.fonts.openSans,
                fontSize: zoom < 13 ? '11px' : '14px',
                fontWeight: 600,
                marginLeft: '50%',
                zIndex: 99,
                width: 'fit-content',
              },
              '.titleTooltip:before': {
                display: 'none',
              },
              '.rect': {
                // @ts-ignore TS doesn't like !important
                pointerEvents: 'none !important',
              },
              '.preview-icn svg': {
                height: '40px !important',
                width: '40px !important',
                maxHeight: 'none !important',
                maxWidth: 'none !important',
                padding: '0 !important',
              },
              '.leaflet-overlay-pane .leaflet-interactive:hover': { filter: 'brightness(125%)', cursor: 'grab' },
            }}
          >
            <Flex justifyContent="space-between" alignItems="center" pl={[4, 0]}>
              <h2 className="h2">{homePageProjectsMapSectionConfiguration.title}</h2>
              <Flex
                sx={{
                  '*': {
                    color: `${linkColor} !important`,
                    textDecoration: 'none',
                  },
                  '&:hover *': {
                    color: `${linkHoverColor} !important`,
                    textDecoration: 'none',
                    svg: {
                      fill: `${linkHoverColor} !important`,
                    },
                  },
                  svg: {
                    marginLeft: 1,
                  },
                }}
              >
                <Link href="/projects" display="flex">
                  {intl.formatMessage({
                    id: 'project.see_all',
                  })}
                  <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Md} color={linkColor} />
                </Link>
              </Flex>
            </Flex>
            {homePageProjectsMapSectionConfiguration.teaser ? (
              <Text as="div" mb={5}>
                {homePageProjectsMapSectionConfiguration.teaser}
              </Text>
            ) : null}
            <MapContainer isMobile={isMobile}>
              <Address
                id="address"
                getPosition={(lat, lng) => flyToPosition(mapRef, lat, lng)}
                getAddress={(addr: AddressComplete | null | undefined) =>
                  addr ? flyToPosition(mapRef, addr.geometry.location.lat, addr.geometry.location.lng) : noop()
                }
                debounce={1200}
                value={address}
                onChange={setAddress}
                placeholder={intl.formatMessage({
                  id: 'proposal.map.form.placeholder',
                })}
              />

              <Map
                whenCreated={map => {
                  mapRef.current = map
                  map.on('zoomend', () => setZoom(mapRef?.current?.getZoom() || 0))
                }}
                center={{
                  lat: homePageProjectsMapSectionConfiguration.centerLatitude,
                  lng: homePageProjectsMapSectionConfiguration.centerLongitude,
                }}
                zoom={homePageProjectsMapSectionConfiguration.zoomMap}
                maxZoom={MAX_MAP_ZOOM}
                style={{
                  height: isMobile ? '100vw' : '33vw',
                  // We don't want the map to be bigger than the screen
                  maxHeight: isMobile ? '' : 'calc(100vh - 70px)',
                  zIndex: 0,
                }}
                zoomControl={false}
                dragging={!L.Browser.mobile}
                tap={false}
                doubleClickZoom={false}
                gestureHandling={!isSafari}
              >
                <CapcoTileLayer />
                <MarkerClusterGroup
                  spiderfyOnMaxZoom
                  showCoverageOnHover={false}
                  zoomToBoundsOnClick
                  spiderfyDistanceMultiplier={4}
                  maxClusterRadius={30}
                >
                  {markers?.length > 0 &&
                    markers.map((mark, idx) => {
                      return (
                        <Marker
                          key={idx}
                          ref={!idx ? markerRef : null}
                          position={[mark.address?.lat, mark.address?.lng]}
                          icon={L.divIcon({
                            className: 'preview-icn',
                            html: renderToString(
                              <Icon name={CapUIIcon.PinFull} size={CapUIIconSize.Lg} color={backgroundColor} />,
                            ),
                            iconSize: [40, 40],
                            iconAnchor: [40 / 2, 40],
                            popupAnchor: [0, -40],
                          })}
                        >
                          <BlankPopup closeButton={false} key="popup-info" autoClose={false}>
                            <Flex p={4} direction="column">
                              <Flex>
                                {mark.cover?.url ? (
                                  <Image
                                    useDs
                                    src={mark.cover?.url}
                                    sx={{
                                      width: 90,
                                      height: 60,
                                      borderRadius: 4,
                                      objectFit: 'cover',
                                    }}
                                    alt="cover"
                                  />
                                ) : null}
                                <Text as="div" fontSize="14px" fontWeight={600} ml={2}>
                                  {mark.title}
                                </Text>
                              </Flex>
                              <Flex justifyContent="space-between" mt={2} alignItems="center">
                                <Flex spacing={4}>
                                  {(mark.isContributionsCounterDisplayable &&
                                    formatCounter(
                                      CapUIIcon.BubbleO,
                                      mark.isExternal
                                        ? mark.externalContributionsCount || 0
                                        : mark.contributions.totalCount,
                                      mark.archived,
                                      intl.formatMessage({ id: 'global.contribution' }),
                                    )) ||
                                    null}
                                  {(mark.isParticipantsCounterDisplayable &&
                                    formatCounter(
                                      CapUIIcon.UserO,
                                      mark.isExternal
                                        ? mark.externalParticipantsCount || 0
                                        : mark.contributors.totalCount +
                                            mark.anonymousVotes.totalCount +
                                            mark.anonymousReplies?.totalCount,
                                      mark.archived,
                                      intl.formatMessage({ id: 'capco.section.metrics.participants' }),
                                    )) ||
                                    null}
                                </Flex>
                                <Link
                                  fontSize="14px"
                                  display="flex"
                                  fontWeight={400}
                                  alignItems="center"
                                  href={mark.isExternal ? mark.externalLink : mark.url}
                                  color={`${linkColor} !important`}
                                  sx={{
                                    textDecoration: 'none !important',
                                    '&:hover *': {
                                      textDecoration: 'none',
                                      svg: {
                                        fill: `${linkHoverColor} !important`,
                                      },
                                    },
                                    svg: {
                                      marginLeft: 1,
                                    },
                                  }}
                                  _hover={{ color: `${linkHoverColor} !important` }}
                                >
                                  {intl.formatMessage({
                                    id: 'show-project',
                                  })}
                                  <Icon name={CapUIIcon.ArrowRight} size={CapUIIconSize.Xs} color={linkColor} />
                                </Link>
                              </Flex>
                            </Flex>
                          </BlankPopup>
                        </Marker>
                      )
                    })}
                </MarkerClusterGroup>
                {geoJsons &&
                  geoJsons.map((geoJson, idx) => (
                    <React.Fragment key={idx}>
                      <GeoJSONView geoJson={geoJson} zoom={zoom || 0} mapRef={mapRef} />
                    </React.Fragment>
                  ))}
                {!isMobile && <ZoomControl position="bottomright" />}
              </Map>
            </MapContainer>
          </Flex>
        </div>
      </div>
    </section>
  )
}
export default withColors(ProjectsMapView)
