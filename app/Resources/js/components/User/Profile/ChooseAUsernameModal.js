// @flow
import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { submit } from 'redux-form';
import type { Dispatch } from '../../../types';
import CloseButton from '../../Form/CloseButton';
import ChooseAUsernameForm, { formName } from './ChooseAUsernameForm';

type Props = {
  dispatch: Dispatch,
};

export class ChooseAUsernameModal extends React.Component<Props> {
  render() {
    const { dispatch } = this.props;
    return (
      <Modal
        animation={false}
        show
        onHide={() => {}}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="complete-your-profile" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ChooseAUsernameForm />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={() => {}} />
          <Button
            id="confirm-username-form-submit"
            type="submit"
            onClick={() => {
              dispatch(submit(formName));
            }}
            bsStyle="primary">
            <FormattedMessage id="global.save" />
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = () => ({});

export default connect(mapStateToProps)(ChooseAUsernameModal);
