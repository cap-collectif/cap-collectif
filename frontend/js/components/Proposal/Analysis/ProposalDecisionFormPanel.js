// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Glyphicon, InputGroup } from 'react-bootstrap';
import { useResize } from '@liinkiing/react-hooks';
import styled, { type StyledComponent } from 'styled-components';
import debounce from 'debounce-promise';
import { reduxForm, formValueSelector, change, Field, SubmissionError } from 'redux-form';
import type { ProposalDecisionFormPanel_proposal } from '~relay/ProposalDecisionFormPanel_proposal.graphql';
import colors from '~/utils/colors';
import { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { GlobalState } from '~/types';
import sizes from '~/utils/sizes';
import component from '~/components/Form/Field';
import select from '~/components/Form/Select';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import ChangeProposalDecisionMutation from '~/mutations/ChangeProposalDecisionMutation';
import UserListField from '~/components/Admin/Field/UserListField';
import { TYPE_FORM } from '~/constants/FormConstants';
import { Validation, ValidateButton, AnalysisForm } from './ProposalAnalysisFormPanel';

const PostWrapper: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 10px;
  padding: 15px;
  background: ${colors.grayF4};
`;

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalDecisionFormPanel_proposal,
  disabled?: boolean,
  initialIsApproved: boolean,
  refusedReasons: Array<{| value: string, label: string |}>,
  onValidate: (boolean, ?boolean) => void,
|};

type Decision = 'FAVOURABLE' | 'UNFAVOURABLE';

export type FormValues = {|
  body: string,
  authors: Array<{| label: string, value: string |}>,
  estimatedCost: number,
  isApproved: ?Decision,
  validate?: boolean,
  isDone: boolean,
  refusedReason: {| value: string, label: string |},
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal, onValidate } = props;
  const input = {
    proposalId: proposal.id,
    body: values.body,
    authors: values.authors.map(author => author.value),
    estimatedCost: values.estimatedCost,
    isApproved:
      values.isApproved === 'FAVOURABLE'
        ? true
        : values.isApproved === 'UNFAVOURABLE'
        ? false
        : null,
    refusedReason: values.isApproved === 'UNFAVOURABLE' ? values.refusedReason?.value : null,
    isDone: values.validate ? true : values.isDone,
  };
  onValidate(true);
  return ChangeProposalDecisionMutation.commit({
    input,
  })
    .then(() => {
      onValidate(false, values.validate);
    })
    .catch(e => {
      if (e instanceof SubmissionError) {
        throw e;
      }
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const formName = 'proposal-decision-form';

export const ProposalDecisionFormPanel = ({
  dispatch,
  initialIsApproved,
  disabled,
  proposal,
}: Props) => {
  const intl = useIntl();
  const [isApproved, setIsApproved] = useState(initialIsApproved);
  const { width } = useResize();
  const isLarge = width < sizes.bootstrapGrid.mdMax;
  const refusedReasons = proposal?.form.analysisConfiguration?.unfavourableStatuses || [];
  const effectiveDate = proposal?.form.analysisConfiguration?.effectiveDate;
  return (
    <>
      <form id={formName}>
        <AnalysisForm>
          <label className="mb-15">
            <FormattedMessage id="proposal.estimation" />
          </label>
          <InputGroup className="form-fields mb-10" bsClass="input-group" style={{ zIndex: '1' }}>
            <InputGroup.Addon>
              <Glyphicon glyph="euro" />
            </InputGroup.Addon>
            <Field
              component={component}
              type="number"
              min={0}
              id="proposalDecision-estimatedCost"
              name="estimatedCost"
              normalize={val => val && parseFloat(val)}
            />
          </InputGroup>
          <label>
            <FormattedMessage id="official.answer" />
          </label>
          <PostWrapper>
            <UserListField
              id="proposalDecision-authors"
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
              id="proposalDecision-body"
              label={<FormattedMessage id="global.contenu" />}
              component={component}
            />
          </PostWrapper>
        </AnalysisForm>
        <Validation isLarge={isLarge}>
          <Field
            onChange={() => setIsApproved('FAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            label={<FormattedMessage id="global.review" />}
            component={component}
            id="isApproved-FAVOURABLE"
            name="isApproved"
            type="radio"
            value="FAVOURABLE"
            radioChecked={isApproved === true}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={12}
              color={colors.lightGreen}
              iconName={ICON_NAME.favorable}
              text="global.favorable"
            />
          </Field>
          <Field
            onChange={() => setIsApproved('UNFAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            component={component}
            id="isApproved-UNFAVOURABLE"
            name="isApproved"
            type="radio"
            value="UNFAVOURABLE"
            radioChecked={isApproved === false}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={10}
              color={colors.dangerColor}
              iconName={ICON_NAME.unfavorable}
              text="global.filter-unfavourable"
            />
          </Field>
          {(isApproved === 'UNFAVOURABLE' || initialIsApproved === 'UNFAVOURABLE') &&
          refusedReasons?.length ? (
            <Field
              selectFieldIsObject
              debounce
              autoload
              labelClassName="control-label"
              inputClassName="fake-inputClassName"
              component={select}
              name="refusedReason"
              id="decision-refusedReason"
              placeholder=" "
              label={<FormattedMessage id="reason" />}
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="true"
              options={refusedReasons}
            />
          ) : null}
          <FormattedMessage
            tagName="p"
            id={effectiveDate ? 'publication.date.personalized' : 'data.publication.automatic'}
            values={{
              date: intl.formatDate(effectiveDate, {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              }),
              hour: intl.formatDate(effectiveDate, {
                hour: 'numeric',
                minute: 'numeric',
              }),
            }}
          />
          <ValidateButton
            disabled={disabled || (isApproved === null && initialIsApproved === null)}
            type="button"
            onClick={() => {
              dispatch(change(formName, 'validate', true));
            }}>
            <FormattedMessage id="validate" />
          </ValidateButton>
        </Validation>
      </form>
    </>
  );
};

const mapStateToProps = (state: GlobalState, { proposal }: Props) => {
  const isApproved = proposal?.decision?.isApproved;
  return {
    initialValues: {
      body: proposal?.decision?.post.body || null,
      estimatedCost: proposal?.decision?.estimatedCost || 0,
      authors: proposal?.decision?.post.authors || [],
      isApproved: isApproved ? 'FAVOURABLE' : isApproved === false ? 'UNFAVOURABLE' : null,
      refusedReason: proposal?.decision?.refusedReason || null,
      isDone: proposal?.decision?.state === 'DONE' || false,
    },
    initialIsApproved: formValueSelector(formName)(state, 'isApproved') || null,
  };
};

const form = reduxForm({
  form: formName,
  validate: null,
  onChange: debounce(onSubmit, 1000),
  onSubmit,
})(ProposalDecisionFormPanel);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalDecisionFormPanel_proposal on Proposal {
      id
      decision {
        state
        estimatedCost
        refusedReason {
          label: name
          value: id
        }
        post {
          id
          body
          authors {
            value: id
            label: username
          }
        }
        isApproved
      }
      form {
        analysisConfiguration {
          effectiveDate
          unfavourableStatuses {
            value: id
            label: name
          }
        }
      }
    }
  `,
});
