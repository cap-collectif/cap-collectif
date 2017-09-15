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
    const { proposal, className, form, categories, dispatch } = this.props;
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
        {proposal.media && (
          <img
            id="proposal-media"
            src={proposal.media.url}
            alt=""
            className="block img-responsive"
          />
        )}
        <div className="block">
          {proposal.summary && (
            <p className="excerpt" style={{ fontStyle: 'italic' }}>
              {proposal.summary}
            </p>
          )}
          <h3 className="h3">{<FormattedMessage id="proposal.description" />}</h3>
          <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
        </div>
        {address &&
        config.canUseDOM && (
          <div className="block" style={{ height: 255 }}>
            <h4 className="h4">Lieu ou adresse</h4>
            <p>{address[0].formatted_address}</p>
            <Map
              center={{
                lat: address[0].geometry.location.lat,
                lng: address[0].geometry.location.lng,
              }}
              zoom={13}
              maxZoom={18}
              style={{
                width: '100%',
                height: 175,
              }}>
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/capcollectif/cj4zmeym20uhr2smcmgbf49cz/tiles/256/{z}/{x}/{y}?access_token=${config.mapboxApiKey}`}
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
          <ProposalVoteButtonWrapper proposal={proposal} />
          <ShareButtonDropdown
            id="proposal-share-button"
            url={proposal._links.show}
            title={proposal.title}
            style={{ marginLeft: 15 }}
          />
          <ProposalReportButton proposal={proposal} />
          <div className="pull-right">
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
        </div>
        <ProposalEditModal proposal={proposal} form={form} categories={categories} />
        <ProposalDeleteModal proposal={proposal} form={form} />
        <ProposalPageComments id={proposal.id} form={form} />
      </div>
    );
  },
});

export default connect()(ProposalPageContent);
