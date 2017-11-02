// @flow
import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';

export const ProposalFormAdminDistrictModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    member: PropTypes.string.isRequired,
    isCreating: PropTypes.bool.isRequired,
  },

  render() {
    const { member, show, isCreating, onClose, onSubmit } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={<FormattedMessage id={!isCreating ? 'district_modal.create.title' : 'district_modal.update.title'} />}
          />
        </Modal.Header>
        <Modal.Body>
          <Field
            label="Titre"
            id={`${member}.name`}
            name={`${member}.name`}
            type="text"
            component={component}
          />
          <Field
            label="Zone"
            help="Au format GeoJSON"
            id={`${member}.geojson`}
            name={`${member}.geojson`}
            type="textarea"
            component={component}
          />
          {/* <LeafletMap
            geoJsons={[geosjon]}
            // defaultMapOptions={{
            //   center: { lat: form.latMap, lng: form.lngMap },
            //   zoom: form.zoomMap,
            // }}
          /> */}
          <p>Options</p>
          <Field
            children="Afficher la zone sur la carte"
            id={`${member}.displayedOnMap`}
            name={`${member}.displayedOnMap`}
            type="checkbox"
            component={component}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} />
        </Modal.Footer>
      </Modal>
    );
  },
});

export default connect()(ProposalFormAdminDistrictModal);
