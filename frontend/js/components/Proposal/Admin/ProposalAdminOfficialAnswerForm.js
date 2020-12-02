// @flow
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import styled, { type StyledComponent } from 'styled-components';
import { Button } from 'react-bootstrap'; // Plz be my last
import { reduxForm, formValueSelector, Field, SubmissionError, submit } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl } from 'react-intl';
import type { ProposalAdminOfficialAnswerForm_proposal } from '~relay/ProposalAdminOfficialAnswerForm_proposal.graphql';
import type { GlobalState, Dispatch } from '~/types';
import { Container } from './ProposalAdminOfficialAnswer';
import UserListField from '~/components/Admin/Field/UserListField';
import component from '~/components/Form/Field';
import SubmitButton from '~/components/Form/SubmitButton';
import UpdateOfficialResponseMutation from '~/mutations/UpdateOfficialResponseMutation';

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalAdminOfficialAnswerForm_proposal,
  dispatch: Dispatch,
  onValidate: () => void,
  publishedAt: string,
  submitting: boolean,
  pristine: boolean,
  invalid: boolean,
|};

const Form: StyledComponent<{}, {}, HTMLFormElement> = styled.form`
  > div:first-child {
    max-width: 300px;
  }

  > div:nth-child(3) {
    max-width: 164px;
  }

  .control-label.label-container {
    font-weight: normal !important;
  }
`;

const formName = 'proposalAdminOfficialAnswerForm';

type FormValues = {|
  body: string,
  publishedAt: string,
  authors: Array<{| label: string, value: string |}>,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { onValidate, proposal } = props;
  return UpdateOfficialResponseMutation.commit({
    input: {
      id: proposal.officialResponse?.id || undefined,
      body: values.body,
      authors: values.authors.map(author => author.value),
      proposal: proposal.id,
      publishedAt: moment(values.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
      isPublished:
        proposal.officialResponse?.isPublished ||
        !(moment(values.publishedAt).diff(moment(), 'hours') >= 1),
    },
  })
    .then(() => {
      if (onValidate) {
        onValidate();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ body, publishedAt, authors }: FormValues) => {
  const errors = {};
  if (!authors || !authors.length) {
    errors.authors = 'global.required';
  }
  if (!body || body === '<p><br></p>') {
    errors.body = 'global.required';
  }
  if (!publishedAt) {
    errors.publishedAt = 'global.required';
  }
  return errors;
};

export const ProposalAdminOfficialAnswerForm = ({
  proposal,
  dispatch,
  publishedAt,
  pristine,
  invalid,
  submitting,
  onValidate,
  handleSubmit,
}: Props) => {
  const { officialResponse } = proposal;
  const isFutur = moment(publishedAt).diff(moment(), 'hours') >= 1;
  return (
    <div className="mt-20">
      <Container>
        <div>
          <h3>
            <FormattedMessage id="official.answer" />
          </h3>
        </div>
        <Form id={formName} onSubmit={handleSubmit}>
          <UserListField
            id="authors"
            name="authors"
            clearable
            selectFieldIsObject
            debounce
            autoload={false}
            multi
            placeholder=" "
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            label={<FormattedMessage id="admin.fields.project.authors" />}
            ariaControls="EventListFilters-filter-author-listbox"
          />
          <Field
            type="editor"
            name="body"
            id="body"
            label={<FormattedMessage id="global.reply" />}
            component={component}
          />
          <Field
            label={<FormattedMessage id="global.updated.date" />}
            id="publishedAt"
            name="publishedAt"
            type="datetime"
            dateTimeInputProps={{
              disabled: officialResponse?.isPublished,
            }}
            disabled={officialResponse?.isPublished}
            component={component}
          />
        </Form>
      </Container>
      <SubmitButton
        type="submit"
        id="proposal_admin_official_answer_publish"
        bsStyle="primary"
        disabled={pristine || invalid || submitting}
        onSubmit={() => {
          dispatch(submit(formName));
        }}
        label={isFutur && !officialResponse?.isPublished ? 'global.plan' : 'source.create.submit'}
      />
      {proposal.officialResponse?.id && (
        <Button onClick={onValidate} className="ml-10">
          <FormattedMessage id="global.cancel" />
        </Button>
      )}
    </div>
  );
};

const mapStateToProps = (state: GlobalState, { proposal }: Props) => {
  return {
    publishedAt: formValueSelector(formName)(state, 'publishedAt'),
    initialValues: {
      authors: proposal.officialResponse?.authors || [],
      body: proposal.officialResponse?.body,
      publishedAt: moment(proposal.officialResponse?.publishedAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  };
};

const form = reduxForm({
  form: formName,
  onSubmit,
  validate,
})(ProposalAdminOfficialAnswerForm);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAdminOfficialAnswerForm_proposal on Proposal {
      id
      officialResponse {
        id
        body
        authors {
          value: id
          label: username
        }
        publishedAt
        isPublished
      }
    }
  `,
});
