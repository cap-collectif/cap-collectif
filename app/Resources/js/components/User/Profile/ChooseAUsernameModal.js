// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { submit, isSubmitting, isInvalid, isPristine } from 'redux-form';
import type { Dispatch, GlobalState } from '../../../types';
import ChooseAUsernameForm, { formName } from './ChooseAUsernameForm';
import SubmitButton from '../../Form/SubmitButton';

type Props = {
  dispatch: Dispatch,
  invalid: boolean,
  submitting: boolean,
  pristine: boolean,
};

export class ChooseAUsernameModal extends React.Component<Props> {
  render() {
    const { dispatch, pristine, invalid, submitting } = this.props;
    return (
      <Modal
        animation={false}
        show
        onHide={() => {}}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="complete-your-profile" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ChooseAUsernameForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            id="confirm-username-form-submit"
            isSubmitting={submitting}
            disabled={pristine || invalid || submitting}
            label="global.save"
            onSubmit={() => {
              dispatch(submit(formName));
            }}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  submitting: isSubmitting(formName)(state),
  invalid: isInvalid(formName)(state),
  pristine: isPristine(formName)(state),
});

export default connect(mapStateToProps)(ChooseAUsernameModal);
