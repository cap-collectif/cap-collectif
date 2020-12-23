// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, type IntlShape, useIntl } from 'react-intl';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import type { ArgumentCardEdition_argument } from '~relay/ArgumentCardEdition_argument.graphql';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';
import UpdateDebateArgumentMutation from '~/mutations/UpdateDebateArgumentMutation';
import Button from '~ds/Button/Button';
import Flex from '~ui/Primitives/Layout/Flex';
import type { GlobalState } from '~/types';
import component from '~/components/Form/Field';
import colors from '~/styles/modules/colors';

const formName = 'argument-card-edition-form';

type Props = {|
  +argument: ArgumentCardEdition_argument,
  +goBack: () => void,
  +body: string,
|};

export const editArgument = (id: string, body: string, intl: IntlShape, onSuccess: () => void) => {
  return UpdateDebateArgumentMutation.commit({ input: { id, body } })
    .then(response => {
      if (response.updateDebateArgument?.errorCode) {
        mutationErrorToast(intl);
      } else onSuccess();
    })
    .catch(() => {
      mutationErrorToast(intl);
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

export const ArgumentCardEdition = ({ argument, goBack, body }: Props) => {
  const intl = useIntl();
  return (
    <Form id={formName}>
      <Field
        name="body"
        component={component}
        type="textarea"
        id="body"
        minLength="1"
        autoComplete="off"
      />
      <Flex justifyContent="flex-end" mt={2}>
        <Button color="neutral-gray.500" onClick={goBack} type="button" mr={6} variantSize="small">
          <FormattedMessage id="global.cancel" />
        </Button>
        <Button
          disabled={(body?.length || 0) < 2}
          onClick={() => editArgument(argument.id, body, intl, goBack)}
          type="button"
          variant="primary"
          variantColor="primary"
          variantSize="medium">
          <FormattedMessage id="modifications.publish" />
        </Button>
      </Flex>
    </Form>
  );
};

const selector = formValueSelector(formName);

const mapStateToProps = (state: GlobalState, { argument }: Props) => ({
  initialValues: {
    body: argument?.body || '',
  },
  body: selector(state, 'body'),
});

const form = reduxForm({
  form: formName,
})(ArgumentCardEdition);

export default createFragmentContainer(connect(mapStateToProps)(form), {
  argument: graphql`
    fragment ArgumentCardEdition_argument on DebateArgument {
      id
      body
    }
  `,
});
