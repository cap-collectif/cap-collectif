// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { type IntlShape } from 'react-intl';
import { reduxForm, Field, formValueSelector, submit } from 'redux-form';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import type { ArgumentCardFormEdition_argument } from '~relay/ArgumentCardFormEdition_argument.graphql';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import UpdateDebateArgumentMutation from '~/mutations/UpdateDebateArgumentMutation';
import Button from '~ds/Button/Button';
import type { Dispatch, GlobalState } from '~/types';
import component from '~/components/Form/Field';
import colors from '~/styles/modules/colors';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';

export const formName = 'argument-card-edition-form';

export type FormValues = {|
  body: string,
|};

type Props = {|
  ...ReduxFormFormProps,
  +intl: IntlShape,
  +argument: ArgumentCardFormEdition_argument,
  +goBack: () => void,
  +body: string,
  +isMobile?: boolean,
  +onSuccess?: () => void,
  +onError?: () => void,
  +getValues?: (values: FormValues) => void,
  +dispatch: Dispatch,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { argument, onSuccess, onError, getValues, isMobile, goBack, intl } = props;

  if (getValues) getValues(values);

  return UpdateDebateArgumentMutation.commit({ input: { id: argument.id, body: values.body } })
    .then(response => {
      if (response.updateDebateArgument?.errorCode) {
        if (!isMobile) mutationErrorToast(intl);
        else if (onError && isMobile) onError();
      } else {
        if (!isMobile) goBack();
        if (onSuccess && isMobile) onSuccess();
      }
    })
    .catch(() => {
      if (!isMobile) mutationErrorToast(intl);
      else if (onError && isMobile) onError();
    });
};

const Form: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
  margin-top: 16px;

  .form-group {
    margin: 0;
  }

  textarea {
    padding: 8px 12px;
    outline: none;
    background: none;
    border: 1px solid ${colors.gray[300]};
    resize: none;
    box-shadow: none !important;
    color: ${colors.gray[900]};
  }
`;

export const ArgumentCardFormEdition = ({
  goBack,
  body,
  isMobile,
  handleSubmit,
  intl,
  dispatch,
}: Props) => (
  <Form id={formName} onSubmit={handleSubmit}>
    <Field
      name="body"
      component={component}
      type="textarea"
      id="body"
      minLength="1"
      autoComplete="off"
    />

    {isMobile ? (
      <Button
        type="submit"
        variant="primary"
        variantColor="primary"
        variantSize="big"
        disabled={body.length < 2}
        onClick={() => dispatch(submit(formName))}
        mt={2}
        width="100%"
        justifyContent="center">
        {intl.formatMessage({ id: 'modifications.publish' })}
      </Button>
    ) : (
      <ButtonGroup justifyContent="flex-end" mt={2}>
        <Button color="neutral-gray.500" onClick={goBack} variantSize="small">
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button
          type="submit"
          onClick={() => dispatch(submit(formName))}
          variant="primary"
          variantColor="primary"
          variantSize="small"
          disabled={body.length < 2}>
          {intl.formatMessage({ id: 'global.edit' })}
        </Button>
      </ButtonGroup>
    )}
  </Form>
);

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState, { argument }: Props) => ({
  initialValues: {
    body: argument.body || '',
  },
  body: selector(state, 'body') || '',
});

const form = reduxForm({
  form: formName,
  onSubmit,
})(ArgumentCardFormEdition);

const ArgumentCardFormEditionConnected = connect<any, any, _, _, _, _>(mapStateToProps)(form);

export default createFragmentContainer(ArgumentCardFormEditionConnected, {
  argument: graphql`
    fragment ArgumentCardFormEdition_argument on DebateArgument {
      id
      body
    }
  `,
});
