import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import GoogleMapReact from 'google-map-react';
import ShareButtonDropdown from '../../Utils/ShareButtonDropdown';
import ProposalEditModal from '../Edit/ProposalEditModal';
import ProposalDeleteModal from '../Delete/ProposalDeleteModal';
import EditButton from '../../Form/EditButton';
import DeleteButton from '../../Form/DeleteButton';
import ProposalReportButton from '../Report/ProposalReportButton';
import ProposalResponse from './ProposalResponse';
import ProposalVoteButtonWrapper from '../Vote/ProposalVoteButtonWrapper';
import config from '../../../config';
import {
  openDeleteProposalModal,
  openEditProposalModal,
} from '../../../redux/modules/proposal';

const SmallMarker = () =>
  <img
    src="/svg/marker.svg"
    className="proposal__map--marker"
    alt="starting point"
  />;

const ProposalPageContent = React.createClass({
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
    const address = proposal.location ? JSON.parse(proposal.location) : null;
    return (
      <div className={classNames(classes)}>
        {proposal.media &&
          <img
            id="proposal-media"
            src={proposal.media.url}
            alt=""
            className="block img-responsive"
          />}
        <div className="block">
          <h3 className="h3">
            {<FormattedMessage id="proposal.description" />}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: proposal.body }} />
        </div>
        {address &&
          <div className="block" style={{ height: 255 }}>
            <h4 className="h4">Lieu ou adresse</h4>
            <p>
              {address[0].formatted_address}
            </p>
            <GoogleMapReact
              style={{
                height: 175,
              }}
              defaultCenter={{
                lat: address[0].geometry.location.lat,
                lng: address[0].geometry.location.lng,
              }}
              bootstrapURLKeys={{
                key: config.mapsAPIKey,
                language: 'fr',
              }}
              defaultZoom={13}
              resetBoundsOnResize
              options={maps => ({
                zoomControlOptions: {
                  position: maps.ControlPosition.RIGHT_TOP,
                  style: maps.ZoomControlStyle.SMALL,
                },
                mapTypeControlOptions: {
                  position: maps.ControlPosition.TOP_RIGHT,
                },
                mapTypeControl: true,
              })}>
              <SmallMarker
                lat={address[0].geometry.location.lat}
                lng={address[0].geometry.location.lng}
              />
            </GoogleMapReact>
          </div>}
        {proposal.responses.map((response, index) =>
          <ProposalResponse key={index} response={response} />,
        )}
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
        <ProposalEditModal
          proposal={proposal}
          form={form}
          categories={categories}
        />
        <ProposalDeleteModal proposal={proposal} form={form} />
      </div>
    );
  },
});

export default connect()(ProposalPageContent);
