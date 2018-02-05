import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
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

let L;

export const ProposalPageContent = React.createClass({
  displayName: 'ProposalPageContent',

  propTypes: {
    proposal: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    className: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      className: '',
    };
  },

  render() {
    const { proposal, className, form, categories, dispatch, user } = this.props;
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
          {user &&
            user.uniqueId === proposal.author.uniqueId && (
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
            <div className="block" style={{ height: 255 }}>
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
          <ProposalResponse key={index} response={response} />
        ))}
        <div className="block proposal__buttons">
          {!proposal.isDraft && (
            <div>
              <ProposalVoteButtonWrapper proposal={proposal} />
              <ShareButtonDropdown
                id="proposal-share-button"
                url={proposal._links.show}
                title={proposal.title}
              />
              <ProposalReportButton proposal={proposal} />
            </div>
          )}
        </div>
        <ProposalEditModal proposal={proposal} form={form} categories={categories} />
        <ProposalDeleteModal proposal={proposal} form={form} />
        {!proposal.isDraft && <ProposalPageComments id={proposal.id} form={form} />}
      </div>
    );
  },
});

const mapStateToProps = state => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(ProposalPageContent);
