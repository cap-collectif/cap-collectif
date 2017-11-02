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
        <div className="block">
          <h2 className="h2 with-buttons">
            {<FormattedMessage id="proposal.tabs.content" />}
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
          </h2>
          {proposal.media && (
            <img
              id="proposal-media"
              src={proposal.media.url}
              alt=""
              className="img-responsive mt-15"
            />
          )}
          {proposal.summary && <p className="excerpt mt-15">{proposal.summary}</p>}
          <h3 className="h3 mt-15">{<FormattedMessage id="proposal.description" />}</h3>
          <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
        </div>
        {address &&
          config.canUseDOM && (
            <div className="block" style={{ height: 255 }}>
              <h3 className="h3">Lieu ou adresse</h3>
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
          {!proposal.isDraft && (
            <div>
              <ProposalVoteButtonWrapper proposal={proposal} />
              <ShareButtonDropdown
                id="proposal-share-button"
                url={proposal._links.show}
                title={proposal.title}
                style={{ marginLeft: 15 }}
              />
            </div>
          )}
          <ProposalReportButton proposal={proposal} />
        </div>
        <ProposalEditModal proposal={proposal} form={form} categories={categories} />
        <ProposalDeleteModal proposal={proposal} form={form} />
        {!proposal.isDraft && <ProposalPageComments id={proposal.id} form={form} />}
      </div>
    );
  },
});

export default connect()(ProposalPageContent);
