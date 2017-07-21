// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type Connector } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import ArgumentActions from '../../../actions/ArgumentActions';
import ArgumentStore from '../../../stores/ArgumentStore';
import renderComponent from '../../Form/Field';
import { closeArgumentEditModal } from '../../../redux/modules/opinion';
import type { State } from '../../../types';

export const formName = 'argument-edit-form';
const validate = ({ body, confirm }: Object) => {
  const errors = {};
  if (!body || body.length <= 2) {
    errors.body = 'argument.constraints.min';
  }
  if (!confirm) {
    errors.confirm = 'argument.constraints.confirm';
  }
  return errors;
};

const onSubmit = (values: Object, dispatch, { argument }) => {
  const opinion = ArgumentStore.opinion;
  const data = Object.assign({}, values);
  data.type = argument.type;
  delete data.confirm;
  return ArgumentActions.update(opinion, argument.id, data).then(() => {
    ArgumentActions.load(ArgumentStore.opinion, argument.type);
    dispatch(closeArgumentEditModal());
  });
};

const ArgumentForm = React.createClass({
  propTypes: {
    argument: PropTypes.object.isRequired,
  },

  render() {
    return (
      <form id="argument-form" ref="form">
        <div className="alert alert-warning edit-confirm-alert">
          <Field
            type="checkbox"
            component={renderComponent}
            id="argument-confirm"
            name="confirm"
            children={<FormattedMessage id="argument.edit.confirm" />}
          />
        </div>
        <Field
          id="argument-body"
          component={renderComponent}
          type="textarea"
          rows={2}
          name="body"
          label={<FormattedMessage id="argument.edit.body" />}
        />
      </form>
    );
  },
});

type PassedProps = { argument: Object };
const connector: Connector<
  PassedProps,
  {},
> = connect((state: State, props: PassedProps) => ({
  initialValues: {
    body: props.argument ? props.argument.body : '',
    confirm: false,
  },
}));

export default connector(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ArgumentForm),
);
