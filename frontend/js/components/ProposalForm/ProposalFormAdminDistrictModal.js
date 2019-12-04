// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import type { State } from '../../types';
import DistrictAdminFields from '../District/DistrictAdminFields';
import { isValid } from '~/services/GeoJsonValidator';

type RelayProps = {|
  index: string,
|};

type Props = {|
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
  district: Object,
|};

type ModalState = {
  valid: boolean,
};

declare type InputEvent = {
  target: HTMLInputElement,
} & Event;

export class ProposalFormAdminDistrictModal extends React.Component<Props, ModalState> {
  constructor(props: Props) {
    super(props);
    this.state = { valid: true };
  }

  handleChangeDistrict(event: InputEvent) {
    if ((event.target: HTMLInputElement).value) {
      try {
        const decoded = JSON.parse((event.target: HTMLInputElement).value);
        this.setState({valid: isValid(decoded)});
      } catch (e) {
        this.setState({valid: false});
      }
    } else {
      this.setState({valid: true});
    }
  }

  render() {
    const { member, show, isCreating, onClose, onSubmit, district } = this.props;
    const { valid } = this.state;

    return (
      <Modal show={show} onHide={onClose} aria-labelledby="report-modal-title-lg" bsSize="large">
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
          <DistrictAdminFields
            member={member}
            district={district}
            enableDesignFields
            onChange={this.handleChangeDistrict.bind(this)}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            label="global.validate"
            isSubmitting={false}
            onSubmit={onSubmit}
            disabled={!valid}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state: State, props: RelayProps) => {
  const selector = formValueSelector('proposal-form-admin-configuration');
  const districts = selector(state, 'districts');
  return {
    district: districts[props.index] ? districts[props.index] : {},
  };
};

export default connect(mapStateToProps)(ProposalFormAdminDistrictModal);
