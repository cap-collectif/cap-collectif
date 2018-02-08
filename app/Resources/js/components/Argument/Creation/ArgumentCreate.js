// @flow
import * as React from 'react';
import {
  reduxForm,
  Field,
  submit,
  SubmissionError,
  clearSubmitErrors,
  type FormProps,
} from 'redux-form';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Button, Alert } from 'react-bootstrap';
import { connect, type MapStateToProps } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';
import ArgumentActions from '../../../actions/ArgumentActions';
import renderComponent from '../../Form/Field';
import type { State, Dispatch } from '../../../types';

const onSubmit = (values, dispatch, { opinion, type, reset }) => {
  const data = {
    body: values.body,
    type: type === 'yes' || type === 'simple' ? 1 : 0,
  };
  return ArgumentActions.add(opinion, data)
    .then(() => {
      ArgumentActions.load(opinion, type === 'no' ? 0 : 1);
      reset();
    })
    .catch((res: Object) => {
      if (res && res.response && res.response.message === 'You contributed to many times.') {
        throw new SubmissionError({ _error: 'publication-limit-reached' });
      }
      throw new SubmissionError({ _error: 'global.error.server.form' });
    });
};

const validate = ({ body }: { body: ?string }) => {
  const errors = {};
  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length <= 2) {
    errors.body = 'argument.constraints.min';
  }
  if (body && body.length > 2000) {
    errors.body = 'argument.constraints.max';
  }
  return errors;
};

type Props = FormProps & {
  type: string,
  opinion: Object,
  user: Object,
  submitting: boolean,
  form: string,
  dispatch: Dispatch,
};

export class ArgumentCreate extends React.Component<Props> {
  render() {
    const { user, opinion, type, dispatch, form, submitting, error } = this.props;
    const disabled = !opinion.isContribuable;
    return (
      <div className="opinion__body box">
        <div className="opinion__data">
          <form id={`argument-form--${type}`}>
            {error && (
              <Alert
                bsStyle="warning"
                onDismiss={() => {
                  dispatch(clearSubmitErrors(form));
                }}>
                {error === 'publication-limit-reached' ? (
                  <div>
                    <h4>
                      <strong>
                        <FormattedMessage id="publication-limit-reached" />
                      </strong>
                    </h4>
                    <FormattedMessage id="publication-limit-reached-proposal-content" />
                  </div>
                ) : (
                  <FormattedHTMLMessage id="global.error.server.form" />
                )}
              </Alert>
            )}
            <LoginOverlay enabled={opinion.isContribuable}>
              <Field
                name="body"
                component={renderComponent}
                id={`arguments-body-${type}`}
                type="textarea"
                rows={2}
                label={<FormattedMessage id={`argument.${type}.add`} />}
                placeholder={`argument.${type}.add`}
                labelClassName="sr-only"
                disabled={disabled}
              />
            </LoginOverlay>
            {user && (
              <Button
                disabled={submitting || disabled}
                onClick={
                  submitting || disabled
                    ? null
                    : () => {
                        dispatch(submit(form));
                      }
                }
                bsStyle="primary">
                <FormattedMessage id={submitting ? 'global.loading' : 'global.publish'} />
              </Button>
            )}
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(
  reduxForm({
    onSubmit,
    validate,
  })(ArgumentCreate),
);
