// @flow
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { reduxForm, Field, arrayPush, change } from 'redux-form';
import { injectIntl, type IntlShape, FormattedMessage } from 'react-intl';

import select from '../../../Form/Select';
import renderComponent from '../../../Form/Field';
import type { Dispatch, GlobalState } from '../../../../types';
import { STEP_TYPES } from '../../../../constants/StepTypeConstants';

type Props = {|
  ...ReduxFormFormProps,
  handleClose?: () => {},
  step: {
    id: string,
    title: string,
    type: string,
    timeRange: { startAt: string, endAt: ?string },
    body: string,
  },
  intl: IntlShape,
  formName: string,
  index?: number,
|};

type FormValues = {|
  title: string,
  type: string,
  body: string,
  endAt: ?string,
  startAt: string,
|};

export const formName = 'projectAdminStepForm';

const onSubmit = (formValues: FormValues, dispatch: Dispatch, props: Props) => {
  const { title, type, body, startAt, endAt } = formValues;

  const stepInput = {
    title,
    type,
    body,
    timeRange: {
      startAt,
      endAt,
    },
  };

  if (props.step && props.index !== undefined && props.index >= 0) {
    dispatch(
      change(props.formName, `steps[${+props.index}]`, {
        id: props.step.id,
        ...stepInput,
      }),
    );
  } else {
    dispatch(
      arrayPush(props.formName, 'steps', {
        id: null,
        ...stepInput,
      }),
    );
  }

  if (props.handleClose) {
    props.handleClose();
  }
};

const validate = ({ title, type, startAt, body }: FormValues) => {
  const errors = {};

  if (!title || title.length < 2) {
    errors.title = 'global.required';
  }

  if (!body || body.length < 2) {
    errors.body = 'global.required';
  }

  if (!type) {
    errors.type = 'global.required';
  }

  if (!startAt) {
    errors.startAt = 'global.required';
  }

  return errors;
};

const DateContainer = styled.div`
  display: flex;
  width: auto;
  flex-direction: row;

  @media screen and (max-width: 500px) {
    flex-direction: column;
  }

  > div {
    margin-right: 2%;
  }

  .form-fields.input-group {
    max-width: 238px;
  }
`;

export function ProjectAdminStepForm(props: Props) {
  const { handleSubmit, form, intl } = props;

  const renderOptions = () =>
    STEP_TYPES.map(st => {
      return {
        value: st.value,
        label: intl.formatMessage({ id: st.label }),
      };
    });

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
      <Field
        component={select}
        id="project-types"
        name="type"
        placeholder={intl.formatMessage({ id: 'choose.type.step' })}
        label={
          <div>
            <FormattedMessage id="global.type" />
            <span className="excerpt">
              <FormattedMessage id="global.mandatory" />
            </span>
          </div>
        }
        options={renderOptions()}
        multi={false}
        clearable={false}
      />
      <Field
        type="textarea"
        name="body"
        label={
          <div>
            <FormattedMessage id="admin.fields.step.body" />
            <span className="excerpt">
              <FormattedMessage id="global.mandatory" />
            </span>
          </div>
        }
        component={renderComponent}
      />
      <DateContainer>
        <Field
          id="startAt"
          component={renderComponent}
          type="datetime"
          name="startAt"
          formName={formName}
          label={
            <div>
              <FormattedMessage id="start-at" />
              <span className="excerpt inline">
                <FormattedMessage id="global.mandatory" />
              </span>
            </div>
          }
          addonAfter={<i className="cap-calendar-2" />}
        />
        <Field
          id="endAt"
          component={renderComponent}
          type="datetime"
          name="endAt"
          formName={formName}
          label={<FormattedMessage id="end-at" />}
          addonAfter={<i className="cap-calendar-2" />}
        />
      </DateContainer>
    </form>
  );
}

const mapStateToProps = (state: GlobalState, { step }: Props) => ({
  initialValues: {
    type: step?.type ? step.type : null,
    body: step?.body ? step.body : null,
    title: step?.title ? step.title : null,
    endAt: step?.timeRange?.endAt ? step.timeRange.endAt : null,
    startAt: step?.timeRange?.startAt ? step.timeRange.startAt : null,
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
