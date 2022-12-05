// @flow
import * as React from 'react';
import L from 'leaflet';
import { useLazyLoadQuery, graphql } from 'react-relay';
import noop from 'lodash/noop';
import {
  MapContainer as Map,
  Marker,
  ZoomControl,
  GeoJSON,
  Tooltip,
  Rectangle,
} from 'react-leaflet';
import { useIntl } from 'react-intl';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { renderToString } from 'react-dom/server';
import { GestureHandling } from 'leaflet-gesture-handling';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { isSafari } from '~/config';
import Link from '~ds/Link/Link';
import Flex from '~/components/Ui/Primitives/Layout/Flex';
import withColors from '~/components/Utils/withColors';
import CapcoTileLayer from '~/components/Utils/CapcoTileLayer';
import type { MapProps } from '../../Proposal/Map/Map.types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import { ICON_NAME as DSICON } from '~ds/Icon/Icon';
import useIsMobile from '~/utils/hooks/useIsMobile';
import { BlankPopup, MapContainer } from '~/components/Proposal/Map/ProposalLeafletMap.style';
import { convertToGeoJsonStyle, formatGeoJsons } from '~/utils/geojson';
import typography from '~/styles/theme/typography';
import Address from '~/components/Form/Address/Address';
import type { AddressComplete } from '~/components/Form/Address/Address.type';
import Text from '~/components/Ui/Primitives/Text';
import { formatCounter } from '~/components/Ui/Project/ProjectCard.utils';
import { flyToPosition } from '~/components/Proposal/Map/ProposalLeafletMap';

const getDistrict = (geoJSON: any) => {
  try {
    return L.geoJson(geoJSON.district);
  } catch (e) {
    return null;
  }
};

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
    projectDistricts {
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
`;

export const ProjectsMapView = ({
  linkColor,
  linkHoverColor,
  backgroundColor,
}: {
  linkColor: string,
  linkHoverColor: string,
  backgroundColor: string,
}) => {
  const intl = useIntl();
  const query = useLazyLoadQuery(QUERY);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  const [address, setAddress] = React.useState(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
  }, []);

  if (!query) return null;

  const { homePageProjectsMapSectionConfiguration } = query;

  const districts = query?.projectDistricts?.edges?.map(d => d.node);
  const markers = query?.projects?.edges
    ?.map(d => d.node)
    .filter(p => !!(p.address && p.address.lat && p.address.lng));

  if (!markers.length) return null;

  const geoJsons = districts ? formatGeoJsons(districts) : null;
  return (
    <section id="projectsMap" className="section--custom">
      <div className="container">
        <div className="row">
          <Flex
            direction="column"
            css={{
              '.leaflet-interactive': {
                strokeDasharray: 10,
              },
              '.titleTooltip': {
                opacity: '1 !important',
                fontFamily: typography.fonts.openSans,
                fontSize: '14px',
                fontWeight: 600,
                marginLeft: '50%',
                zIndex: 99,
                width: 'fit-content',
                '::before': { display: 'none' },
              },
            }}>
            <Flex justifyContent="space-between" alignItems="center" pl={[4, 0]}>
              <h2 className="h2">{homePageProjectsMapSectionConfiguration.title}</h2>
              <Flex
                css={{
                  '*': { color: `${linkColor} !important`, textDecoration: 'none' },
                  '&:hover *': {
                    color: `${linkHoverColor} !important`,
                    textDecoration: 'none',
                    svg: { fill: `${linkHoverColor} !important` },
                  },
                  svg: { marginLeft: 5 },
                }}>
                <Link href="/projects">
                  {intl.formatMessage({ id: 'project.see_all' })}
                  <Icon name={ICON_NAME.arrowRight} size={15} color={linkColor} />
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
                getAddress={(addr: ?AddressComplete) =>
                  addr
                    ? flyToPosition(mapRef, addr.geometry.location.lat, addr.geometry.location.lng)
                    : noop()
                }
                debounce={1200}
                value={address}
                onChange={setAddress}
                placeholder={intl.formatMessage({ id: 'proposal.map.form.placeholder' })}
              />

              <Map
                whenCreated={(map: MapProps) => {
                  mapRef.current = map;
                }}
                center={{
                  lat: homePageProjectsMapSectionConfiguration.centerLatitude,
                  lng: homePageProjectsMapSectionConfiguration.centerLongitude,
                }}
                zoom={homePageProjectsMapSectionConfiguration.zoomMap}
                maxZoom={20}
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
                gestureHandling={!isSafari}>
                <CapcoTileLayer />
                <MarkerClusterGroup
                  spiderfyOnMaxZoom
                  showCoverageOnHover={false}
                  zoomToBoundsOnClick
                  spiderfyDistanceMultiplier={4}
                  maxClusterRadius={30}>
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
                              <Icon name={ICON_NAME.pin3} size={40} color={backgroundColor} />,
                            ),
                            iconSize: [40, 40],
                            iconAnchor: [40 / 2, 40],
                            popupAnchor: [0, -40],
                          })}>
                          <BlankPopup closeButton={false} key="popup-info" autoClose={false}>
                            <Flex p={4} direction="column">
                              <Flex spacing={2}>
                                {mark.cover?.url ? (
                                  <img
                                    src={mark.cover?.url}
                                    style={{
                                      width: 90,
                                      height: 60,
                                      borderRadius: 4,
                                      objectFit: 'cover',
                                    }}
                                    alt="cover"
                                  />
                                ) : null}
                                <Text as="div" fontSize="14px" fontWeight={600}>
                                  {mark.title}
                                </Text>
                              </Flex>
                              <Flex justifyContent="space-between" mt={2} alignItems="center">
                                <Flex spacing={4}>
                                  {(mark.isContributionsCounterDisplayable &&
                                    formatCounter(
                                      DSICON.BUBBLE_O,
                                      mark.isExternal
                                        ? mark.externalContributionsCount || 0
                                        : mark.contributions.totalCount,
                                      mark.archived,
                                    )) ||
                                    null}
                                  {(mark.isParticipantsCounterDisplayable &&
                                    formatCounter(
                                      DSICON.USER_O,
                                      mark.isExternal
                                        ? mark.externalParticipantsCount || 0
                                        : mark.contributors.totalCount +
                                            mark.anonymousVotes.totalCount +
                                            mark.anonymousReplies?.totalCount,
                                      mark.archived,
                                    )) ||
                                    null}
                                </Flex>
                                <Link
                                  fontSize="14px"
                                  fontWeight={400}
                                  href={mark.isExternal ? mark.externalLink : mark.url}
                                  color={`${linkColor} !important`}
                                  css={{
                                    textDecoration: 'none !important',
                                    '&:hover *': {
                                      color: `${linkHoverColor} !important`,
                                      textDecoration: 'none',
                                      svg: { fill: `${linkHoverColor} !important` },
                                    },
                                    svg: { marginLeft: 5 },
                                  }}>
                                  {intl.formatMessage({ id: 'show-project' })}
                                  <Icon name={ICON_NAME.arrowRight} size={12} color={linkColor} />
                                </Link>
                              </Flex>
                            </Flex>
                          </BlankPopup>
                        </Marker>
                      );
                    })}
                </MarkerClusterGroup>
                {geoJsons &&
                  geoJsons.map((geoJson, idx) => {
                    const districtGeoJSON = getDistrict(geoJson);
                    return (
                      <React.Fragment key={idx}>
                        <GeoJSON
                          style={convertToGeoJsonStyle(geoJson.style)}
                          key={idx}
                          data={geoJson.district}
                        />
                        {geoJson.titleOnMap ? (
                          <Rectangle
                            bounds={districtGeoJSON?.getBounds()}
                            pathOptions={{ color: 'transparent' }}
                            interactive>
                            <Tooltip interactive permanent className="titleTooltip">
                              <a
                                href={`/project-district/${geoJson.slug || ''}`}
                                style={{ color: 'black', textDecoration: 'none' }}>
                                {geoJson.titleOnMap}
                              </a>
                            </Tooltip>
                          </Rectangle>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                {!isMobile && <ZoomControl position="bottomright" />}
              </Map>
            </MapContainer>
          </Flex>
        </div>
      </div>
    </section>
  );
};

export default withColors(ProjectsMapView);
