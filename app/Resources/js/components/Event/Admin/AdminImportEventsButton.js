// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { isSubmitting, isInvalid, isPristine, submit } from 'redux-form';
import AdminImportEventsForm, { formName } from './AdminImportEventsForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { GlobalState, Dispatch } from '../../../types';

type State = {|
  showModal: boolean,
|};

type Props = {|
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
  submitForm: () => void,
|};

export class AdminImportEventsButton extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  render() {
    const { invalid, pristine, submitting, submitForm } = this.props;
    const { showModal } = this.state;
    return (
      <div>
        <Button
          id="AdminImportEventsButton-import"
          bsStyle="default"
          className="mt-10"
          onClick={() => {
            this.setState({ showModal: true });
          }}>
          <FormattedMessage id="import" />
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="modal-add-events-via-file" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <FormattedMessage id="import-events-helptext" />
            </p>
            <AdminImportEventsForm
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
            <SubmitButton
              id="AdminImportEventsButton-submit"
              label="import"
              isSubmitting={submitting}
              disabled={invalid || pristine}
              onSubmit={() => submitForm()}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  pristine: isPristine(formName)(state),
  invalid: isInvalid(formName)(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  submitForm: () => {
    dispatch(submit(formName));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdminImportEventsButton);
