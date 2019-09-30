// @flow
import * as React from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import RegistrationForm, { form } from './RegistrationForm';
import LoginSocialButtons from '../Login/LoginSocialButtons';
import { closeRegistrationModal, hideChartModal } from '../../../redux/modules/user';
import type { State } from '../../../types';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

type OwnProps = {|
  +charterBody?: ?string,
|};

type StateProps = {|
  +show: boolean,
  +textTop: ?string,
  +textBottom: ?string,
  +submitting: boolean,
  +displayChartModal: boolean,
|};

type DispatchProps = {|
  +onClose: typeof closeRegistrationModal,
  +onSubmit: typeof submit,
  +onCloseChart: typeof hideChartModal,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
  ...DispatchProps,
|};

type Action = typeof closeRegistrationModal | typeof submit | typeof hideChartModal;

export class RegistrationModal extends React.Component<Props> {
  form: ?React.Component<*>;

  render() {
    const {
      submitting,
      onSubmit,
      onClose,
      show,
      textTop,
      textBottom,
      displayChartModal,
      onCloseChart,
      charterBody,
    } = this.props;

    if (displayChartModal) {
      return (
        <Modal
          animation={false}
          show={displayChartModal}
          autoFocus
          onHide={onCloseChart}
          bsSize="medium"
          aria-labelledby="contained-modal-title-lg"
          enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg" componentClass="h1">
              {<FormattedMessage id="charter" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <WYSIWYGRender value={charterBody} />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton label="global.close" onClose={onCloseChart} />
          </Modal.Footer>
        </Modal>
      );
    }
    return (
      <Modal
        animation={false}
        show={show}
        autoFocus
        onHide={onClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
        enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg" componentClass="h1">
            {<FormattedMessage id="global.register" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {textTop && (
            <Alert bsStyle="info" className="text-center">
              <WYSIWYGRender value={textTop} />
            </Alert>
          )}
          <LoginSocialButtons prefix="registration." />
          <RegistrationForm
            ref={c => {
              this.form = c;
            }}
            // $FlowFixMe
            onSubmitFail={this.stopSubmit}
            // $FlowFixMe
            onSubmitSuccess={this.handleSubmitSuccess}
          />
          {textBottom && (
            <WYSIWYGRender className="text-center small excerpt mt-15" value={textBottom} />
          )}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} />
          <SubmitButton
            id="confirm-register"
            label="global.register"
            isSubmitting={submitting}
            onSubmit={onSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = state => ({
  textTop: state.user.registration_form.topTextDisplayed
    ? state.user.registration_form.topText
    : null,
  textBottom: state.user.registration_form.bottomTextDisplayed
    ? state.user.registration_form.bottomText
    : null,
  show: state.user.showRegistrationModal,
  displayChartModal: state.user.displayChartModal,
  submitting: isSubmitting(form)(state),
  charterBody: state.default.parameters['charter.body'],
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeRegistrationModal()),
  onSubmit: () => dispatch(submit(form)),
  onCloseChart: () => dispatch(hideChartModal()),
});

export default connect<Props, State, Action, _, _>(
  mapStateToProps,
  mapDispatchToProps,
)(RegistrationModal);
