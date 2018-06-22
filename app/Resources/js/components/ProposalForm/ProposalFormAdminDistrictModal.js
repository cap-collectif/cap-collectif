// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import component from '../Form/Field';

type Props = {
  show: boolean,
  onClose: Function,
  onSubmit: Function,
  member: string,
  isCreating: boolean,
};

export class ProposalFormAdminDistrictModal extends React.Component<Props> {
  render() {
    const { member, show, isCreating, onClose, onSubmit } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title
            id="report-modal-title-lg"
            children={
              <FormattedMessage
                id={!isCreating ? 'district_modal.create.title' : 'district_modal.update.title'}
              />
            }
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
            label={<FormattedMessage id="admin.fields.proposal.map.zone" />}
            help={<FormattedMessage id="admin.fields.proposal.map.helpFormatGeojson" />}
            id={`${member}.geojson`}
            name={`${member}.geojson`}
            type="textarea"
            component={component}
          />
          <p>Options</p>
          <Field
            children={<FormattedMessage id="admin.fields.proposal.map.displayZones" />}
            id={`${member}.displayedOnMap`}
            name={`${member}.displayedOnMap`}
            type="checkbox"
            normalize={val => !!val}
            component={component}
          />
          <Field
            label={<FormattedMessage id="admin.fields.proposal.map.style" />}
            help={<FormattedMessage id="admin.fields.proposal.map.helpFormatCSS" />}
            id={`${member}.geojsonStyle`}
            name={`${member}.geojsonStyle`}
            type="textarea"
            component={component}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect()(ProposalFormAdminDistrictModal);
