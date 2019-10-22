// @flow
import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, arrayPush, change } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import renderComponent from '../../../Form/Field';
import type { Dispatch, GlobalState } from '../../../../types';

type Props = {|
  ...ReduxFormFormProps,
  step: { id: string, title: string },
  intl: IntlShape,
  formName: string,
  index?: number,
|};

type FormValues = {|
  title: string,
  type: string,
|};

export const formName = 'projectAdminStepForm';

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  if (props.step && props.index) {
    dispatch(
      change(props.formName, `steps[${+props.index}]`, {
        id: props.step.id,
        type: formValues.type,
        title: formValues.title,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        type: formValues.title,
        title: formValues.title,
      }),
    );
  }
};

const validate = ({ title, type }: FormValues) => {
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!type) {
    errors.type = 'global.required';
  }

  return errors;
};

export function ProjectAdminStepForm(props: Props) {
  const { handleSubmit, form } = props;

  return (
    <form onSubmit={handleSubmit} id={form}>
      <Field
        type="text"
        name="title"
        label={
          <div>
            <FormattedMessage id="admin.fields.group.title" />
            <span className="excerpt">
              <FormattedMessage id="global.mandatory" />
            </span>
          </div>
        }
        component={renderComponent}
      />
    </form>
  );
}

const mapStateToProps = (state: GlobalState, { step }: Props) => ({
  initialValues: {
    title: step && step.title ? step.title : null,
  },
});

const form = injectIntl(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(ProjectAdminStepForm),
);

export default connect(mapStateToProps)(form);
