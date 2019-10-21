// @flow
import * as React from 'react';
import L from 'leaflet';
import { storiesOf } from '@storybook/react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { BlankPopup } from '../../components/Proposal/Map/ProposalLeafletMap';
import {
  PopoverCover,
  PopoverContainer,
  AuthorContainer,
  TitleContainer,
} from '../../components/Proposal/Map/ProposalMapPopover';
import { proposal as proposalMock } from '../mocks/proposal';
import { UserAvatar } from '../../components/User/UserAvatar';
import { UserLink } from '../../components/User/UserLink';
import type { FeatureToggles } from '../../types';
import { features as defaultFeatures } from '../../redux/modules/default';

// TODO: mieux typer l'ensemble du storybook
type Props = {
  proposal: Object,
  features: FeatureToggles,
};

export const ProposalMapPopover = (props: Props) => {
  const { proposal, features } = props;

  const publicToken =
    '***REMOVED***';

  return (
    <React.Fragment>
      <Map
        center={{ lat: 48.8586047, lng: 2.3137325 }}
        zoom={12}
        maxZoom={18}
        className="zi-0"
        style={{
          width: '500px',
          height: '500px',
          margin: 'auto',
        }}>
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
        />
        <Marker
          position={[
            proposal.address && proposal.address.lat,
            proposal.address && proposal.address.lng,
          ]}
          icon={L.icon({
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
          })}>
          <BlankPopup closeButton={false}>
            {features.display_pictures_in_depository_proposals_list && proposal.media && (
              <PopoverCover src={proposal.media.url} alt="proposal-illustration" />
            )}
            <PopoverContainer>
              <AuthorContainer>
                <UserAvatar className="pull-left" user={proposal.author} />
                <UserLink user={proposal.author} toggled />
                <div>
                  <span>12 avril 2017</span>
                </div>
              </AuthorContainer>
              <TitleContainer>
                <a href={proposal.url}>{proposal.title}</a>
              </TitleContainer>
            </PopoverContainer>
          </BlankPopup>
        </Marker>
      </Map>
    </React.Fragment>
  );
};

const info = {
  info: {
    text: `
        <p>Click on the marker to see the Popover</p>
      `,
  },
};

storiesOf('Cap Collectif|ProposalMapPopover', module)
  .add(
    'default case',
    () => {
      return <ProposalMapPopover proposal={proposalMock} features={defaultFeatures} />;
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
      );
    },
    info,
  );
