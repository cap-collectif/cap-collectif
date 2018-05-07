import { submit } from 'redux-form';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../Form/CloseButton';
// import DeleteAccountMutation from "../../mutations/DeleteAccountMutation";
import type { Dispatch } from '../../types';
import { closeDeleteAccountModal } from '../../redux/modules/user';

const formName = 'delete-user';

// type FormValues = Object;

type Props = {
  show: boolean,
  dispatch: Dispatch,
};

/* const Delete = (values: FormValues) => {
  console.log(values);
  return DeleteAccountMutation.commit({ input: { removal: 'hard' } }).then(() => {
    window.location.reload();
    return true;
  });
}; */

export class DeleteAccountModal extends Component<Props> {
  render() {
    const { show, dispatch } = this.props;
    const removalName = 'type-of-removal';
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <b>{<FormattedMessage id="account-delete-confirmation" />}</b>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <b>
                <FormattedMessage id="account-delete-warning" />
              </b>
            </p>
            <p>
              <i className="cap cap-id-8" />
              <FormattedMessage id="alias-name-information" />
            </p>
            <p>
              <i className="cap cap-download-12" />
              <FormattedMessage id="data-amount-contributions-votes" />
            </p>
            <form name={formName}>
              <label>Soft delete</label>
              <input type="radio" name={removalName} value="soft" checked="true" />
              <br />
              <label>Hard delete</label>
              <input type="radio" name={removalName} value="hard" checked="" />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => {
                dispatch(closeDeleteAccountModal());
              }}
            />
            <Button
              id="confirm-delete-form-submit"
              type="submit"
              onClick={() => {
                dispatch(submit('delete-user'));
              }}
              bsStyle="danger">
              {<FormattedMessage id="global.removeDefinitively" />}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isDeleting: state.isDeleting,
    show: state.user.showDeleteAccountModal || false,
  };
};

export default connect(mapStateToProps)(DeleteAccountModal);
