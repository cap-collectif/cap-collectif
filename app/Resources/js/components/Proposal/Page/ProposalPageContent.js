// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import classNames from 'classnames';
import { Map, Marker, TileLayer } from 'react-leaflet-universal';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import ProposalEditModal from '../Edit/ProposalEditModal';
import ProposalDeleteModal from '../Delete/ProposalDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import ProposalReportButton from '../Report/ProposalReportButton';
import ProposalPageComments from './ProposalPageComments';
import ProposalResponse from './ProposalResponse';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import { openDeleteProposalModal, openEditProposalModal } from '../../../redux/modules/proposal';
import config from '../../../config';
import type { ProposalPageContent_proposal } from './__generated__/ProposalPageContent_proposal.graphql';
import type { ProposalPageContent_viewer } from './__generated__/ProposalPageContent_viewer.graphql';

let L;

type Props = {
  viewer: ?ProposalPageContent_viewer,
  proposal: ProposalPageContent_proposal,
  form: Object,
  categories: Array<Object>,
  className: string,
  dispatch: Function,
};

export class ProposalPageContent extends React.Component<Props> {
  static defaultProps = {
    className: '',
  };

  render() {
    const { proposal, className, form, categories, dispatch, viewer } = this.props;
    const classes = {
      proposal__content: true,
      [className]: true,
    };
    if (config.canUseDOM) {
      L = require('leaflet'); // eslint-disable-line
    }

    const address = proposal.address ? JSON.parse(proposal.address) : null;

    return (
      <div className={classNames(classes)}>
        <div className="block">
          {viewer &&
            viewer.id === proposal.author.id && (
              <div className="actions">
                <EditButton
                  id="proposal-edit-button"
                  author={proposal.author}
                  onClick={() => {
                    dispatch(openEditProposalModal());
                  }}
                  editable={form.isContribuable}
                />
                <DeleteButton
                  id="proposal-delete-button"
                  author={proposal.author}
                  onClick={() => {
                    dispatch(openDeleteProposalModal());
                  }}
                  style={{ marginLeft: '15px' }}
                  deletable={form.isContribuable}
                />
              </div>
            )}
          {proposal.media && (
            <img
              id="proposal-media"
              src={proposal.media.url}
              alt={proposal.title}
              className="img-responsive mb-15"
            />
          )}
          {proposal.summary && <p className="excerpt">{proposal.summary}</p>}
          {proposal.body && (
            <div>
              <h3 className="h3">
                <FormattedMessage id="proposal.description" />
              </h3>
              <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
            </div>
          )}
        </div>
        {address &&
          config.canUseDOM && (
            <div className="block proposal-map__block">
              <h3 className="h3">
                <FormattedMessage id="proposal.map.form.field" />
              </h3>
              <p>{address[0].formatted_address}</p>
              <Map
                center={{
                  lat: address[0].geometry.location.lat,
                  lng: address[0].geometry.location.lng,
                }}
                zoom={16}
                maxZoom={18}
                style={{
                  width: '100%',
                  height: 175,
                }}>
                <TileLayer
                  attribution="&copy; <a href&quot;https://www.mapbox.com/about/maps/&quot;>Mapbox</a> &copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> <a href&quot;https://www.mapbox.com/map-feedback/#/-74.5/40/10&quot;>Improve this map</a>"
                  url={`https://api.mapbox.com/styles/v1/capcollectif/cj4zmeym20uhr2smcmgbf49cz/tiles/256/{z}/{x}/{y}?access_token=${
                    config.mapboxApiKey
                  }`}
                />
                <Marker
                  position={[address[0].geometry.location.lat, address[0].geometry.location.lng]}
                  icon={L.icon({
                    // eslint-disable-line
                    iconUrl: '/svg/marker.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                  })}
                />
              </Map>
            </div>
          )}
        {proposal.responses.map((response, index) => (
          /* $FlowFixMe */
          <ProposalResponse key={index} response={response} />
        ))}
        <div className="block proposal__buttons">
          {proposal.publicationStatus !== 'DRAFT' && (
            <div>
              <ProposalVoteButtonWrapper className="mr-15" proposal={proposal} />
              <ShareButtonDropdown
                id="proposal-share-button"
                url={proposal.show_url}
                title={proposal.title}
              />
              {/* $FlowFixMe */}
              <ProposalReportButton proposal={proposal} />
            </div>
          )}
        </div>
        {/* $FlowFixMe */}
        <ProposalEditModal proposal={proposal} form={form} categories={categories} />
        {/* $FlowFixMe */}
        <ProposalDeleteModal proposal={proposal} form={form} />
        {proposal.publicationStatus !== 'DRAFT' && (
          <ProposalPageComments id={proposal.id} form={form} />
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProposalPageContent, {
  viewer: graphql`
    fragment ProposalPageContent_viewer on User {
      id
    }
  `,
  proposal: graphql`
    fragment ProposalPageContent_proposal on Proposal {
      id
      author {
        id
      }
      address
      body
      summary
      media {
        url
      }
      ...ProposalReportButton_proposal
      publicationStatus
      title
      show_url
      currentVotableStep {
        id
        open
      }
      responses {
        ...ProposalResponse_response
      }
    }
  `,
});
