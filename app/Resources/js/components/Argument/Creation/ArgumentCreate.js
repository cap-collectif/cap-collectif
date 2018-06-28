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
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import component from '../../Form/Field';
import AddArgumentMutation from '../../../mutations/AddArgumentMutation';
import type { State, Dispatch } from '../../../types';

type FormValues = { body: ?string };
type FormValidValues = { body: string };

type Props = FormProps & {
  type: 'FOR' | 'AGAINST' | 'SIMPLE',
  argumentable: { id: string, isContribuable: boolean },
  user: { id: string },
  submitting: boolean,
  form: string,
  dispatch: Dispatch,
};

const onSubmit = (
  values: FormValidValues,
  dispatch: Dispatch,
  { argumentable, type, reset }: Props,
) => {
  const input = {
    argumentableId: argumentable.id,
    body: values.body,
    type: type === 'FOR' || type === 'SIMPLE' ? 'FOR' : 'AGAINST',
  };

  return AddArgumentMutation.commit({ input })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'success', content: 'alert.success.add.argument' },
      });
      reset();
    })
    .catch(res => {
      if (res && res.response && res.response.message === 'You contributed too many times.') {
        throw new SubmissionError({ _error: 'publication-limit-reached' });
      }
      throw new SubmissionError({ _error: 'global.error.server.form' });
    });
};

const validate = ({ body }: FormValues) => {
  const errors = {};
  if (!body || body.replace(/<\/?[^>]+(>|$)/g, '').length <= 2) {
    errors.body = 'argument.constraints.min';
  }
  if (body && body.length > 2000) {
    errors.body = 'argument.constraints.max';
  }
  return errors;
};

export class ArgumentCreate extends React.Component<Props> {
  render() {
    const { user, argumentable, type, dispatch, form, submitting, error } = this.props;
    const disabled = !argumentable.isContribuable || !user;
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
                    <FormattedMessage id="publication-limit-reached-argument-content" />
                  </div>
                ) : (
                  <FormattedHTMLMessage id="global.error.server.form" />
                )}
              </Alert>
            )}
            <Field
              name="body"
              component={component}
              id={`arguments-body-${type}`}
              type="textarea"
              rows={2}
              label={<FormattedMessage id={`argument.${type === 'AGAINST' ? 'no' : 'yes'}.add`} />}
              placeholder={`argument.${type === 'AGAINST' ? 'no' : 'yes'}.add`}
              labelClassName="sr-only"
              disabled={disabled}
            />
            {!disabled && (
              <Button
                disabled={submitting}
                onClick={() => {
                  dispatch(submit(form));
                }}
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
