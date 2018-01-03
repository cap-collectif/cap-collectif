// @flow
import React, { PropTypes } from 'react';
import { reduxForm, Field, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import LoginOverlay from '../../Utils/LoginOverlay';
import ArgumentActions from '../../../actions/ArgumentActions';
import renderComponent from '../../Form/Field';
import type { State } from '../../../types';

const onSubmit = (values, dispatch, { opinion, type, reset }) => {
  const data = {
    body: values.body,
    type: type === 'yes' || type === 'simple' ? 1 : 0,
  };
  return ArgumentActions.add(opinion, data).then(() => {
    ArgumentActions.load(opinion, type === 'no' ? 0 : 1);
    reset();
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

const ArgumentCreate = React.createClass({
  propTypes: {
    type: PropTypes.string.isRequired,
    opinion: PropTypes.object.isRequired,
    user: PropTypes.object,
    submitting: PropTypes.bool.isRequired,
    form: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  render() {
    const { user, opinion, type, dispatch, form, submitting } = this.props;
    const disabled = !opinion.isContribuable;
    return (
      <div className="opinion__body box">
        <div className="opinion__data">
          <form id={`argument-form--${type}`}>
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
  },
});

const mapStateToProps = (state: State) => {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps)(
  reduxForm({
    onSubmit,
    validate,
  })(ArgumentCreate),
);
