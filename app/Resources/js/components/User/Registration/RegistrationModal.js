// @flow
import * as React from 'react';
import { Modal, Alert } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { submit, isSubmitting } from 'redux-form';
import { graphql, QueryRenderer } from 'react-relay';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import RegistrationForm, { form } from './RegistrationForm';
import LoginSocialButtons from '../Login/LoginSocialButtons';
import { closeRegistrationModal, hideChartModal } from '../../../redux/modules/user';
import type { State } from '../../../types';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import type { RegistrationModalQueryResponse } from '~relay/RegistrationModalQuery.graphql';
import type { RegistrationForm_query } from '~relay/RegistrationForm_query.graphql';

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
  query: RegistrationForm_query,
|};

type Action = typeof closeRegistrationModal | typeof submit | typeof hideChartModal;

export class RegistrationModal extends React.Component<Props> {
  form: ?React.Component<*>;

  renderRegistrationForm = ({
    error,
    props,
  }: {
    ...ReactRelayReadyState,
    props: ?RegistrationModalQueryResponse,
  }) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    return (
      <RegistrationForm
        query={props}
        ref={c => {
          this.form = c;
        }}
      />
    );
  };

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
          <QueryRenderer
            environment={environment}
            query={graphql`
              query RegistrationModalQuery {
                ...RegistrationForm_query
              }
            `}
            variables={{}}
            render={this.renderRegistrationForm}
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
