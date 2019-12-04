// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import component from '../../Form/Field';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import ChangeArgumentMutation from '../../../mutations/ChangeArgumentMutation';
import { closeArgumentEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';
import type { ArgumentForm_argument } from '~relay/ArgumentForm_argument.graphql';

export const formName = 'argument-edit-form';

type FormValues = {
  body?: string,
  confirm?: boolean,
};
type FormValidValues = {
  body: string,
  confirm?: boolean,
};
type Props = {|
  argument: ArgumentForm_argument,
|};

const validate = ({ body, confirm }: FormValues) => {
  const errors = {};
  if (!body || body.length <= 2) {
    errors.body = 'argument.constraints.min';
  }
  if (!confirm) {
    errors.confirm = 'argument.constraints.confirm';
  }
  return errors;
};

const onSubmit = (values: FormValidValues, dispatch, { argument }: Props) => {
  const input = {
    argumentId: argument.id,
    body: values.body,
  };
  return ChangeArgumentMutation.commit({ input })
    .then(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'success', content: 'alert.success.update.argument' },
      });
      dispatch(closeArgumentEditModal());
    })
    .catch(() => {
      AppDispatcher.dispatch({
        actionType: 'UPDATE_ALERT',
        alert: { bsStyle: 'danger', content: 'alert.danger.update.argument' },
      });
    });
};

class ArgumentForm extends React.Component<Props> {
  render() {
    return (
      <form id="argument-form" ref="form">
        <div className="alert alert-warning edit-confirm-alert">
          <Field
            type="checkbox"
            component={component}
            id="argument-confirm"
            name="confirm"
            children={<FormattedMessage id="argument.edit.confirm" />}
          />
        </div>
        <Field
          id="argument-body"
          component={component}
          type="textarea"
          rows={2}
          name="body"
          label={<FormattedMessage id="global.contenu" />}
        />
      </form>
    );
  }
}

const mapStateToProps = (state: State, props: Props) => ({
  initialValues: {
    body: props.argument.body,
    confirm: false,
  },
});
const connector = connect(mapStateToProps);

const container = connector(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ArgumentForm),
);

export default createFragmentContainer(container, {
  argument: graphql`
    fragment ArgumentForm_argument on Argument {
      id
      body
    }
  `,
});
