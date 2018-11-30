// @flow
import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import SubmitButton from '../Form/SubmitButton';
import type { State } from '../../types';
import DistrictAdminFields from '../District/DistrictAdminFields';

type RelayProps = {
  index: string,
};

type Props = {
  show: boolean,
  onClose: () => void,
  onSubmit: () => void,
  member: string,
  isCreating: boolean,
  district: Object,
};

export class ProposalFormAdminDistrictModal extends React.Component<Props> {
  render() {
    const { member, show, isCreating, onClose, onSubmit, district } = this.props;
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
          <DistrictAdminFields member={member} district={district} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton label="global.validate" isSubmitting={false} onSubmit={onSubmit} />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => {
  const selector = formValueSelector('proposal-form-admin-configuration');
  const districts = selector(state, 'districts');
  const index = props.index ? props.index : null;
  return {
    district: districts[index] ? districts[index] : {},
  };
};

export default connect(mapStateToProps)(ProposalFormAdminDistrictModal);
