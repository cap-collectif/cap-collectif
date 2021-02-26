// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Glyphicon, InputGroup } from 'react-bootstrap';
import { useResize } from '@liinkiing/react-hooks';
import debounce from 'debounce-promise';
import { reduxForm, formValueSelector, change, Field, SubmissionError } from 'redux-form';
import type { ProposalAssessmentFormPanel_proposal } from '~relay/ProposalAssessmentFormPanel_proposal.graphql';
import colors from '~/utils/colors';
import { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { GlobalState, Dispatch } from '~/types';
import { bootstrapGrid } from '~/utils/sizes';
import component from '~/components/Form/Field';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import { TYPE_FORM } from '~/constants/FormConstants';
import { Validation, ValidateButton, AnalysisForm } from './ProposalAnalysisFormPanel';
import ChangeProposalAssessmentMutation from '~/mutations/ChangeProposalAssessmentMutation';
import EvaluateProposalAssessmentMutation from '~/mutations/EvaluateProposalAssessmentMutation';
import { type SubmittingState } from './ProposalFormSwitcher';
import ProposalRevision from '~/shared/ProposalRevision/ProposalRevision';
import { RevisionButton } from '~/shared/ProposalRevision/styles';
import ProposalRevisionPanel from '~/components/Proposal/Analysis/ProposalRevisionPanel';

type Decision = 'FAVOURABLE' | 'UNFAVOURABLE';

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalAssessmentFormPanel_proposal,
  disabled?: boolean,
  initialStatus: Decision,
  proposalRevisionsEnabled: boolean,
  onValidate: (SubmittingState, ?boolean) => void,
  costEstimationEnabled: boolean,
  officialResponse: ?string,
|};

export type FormValues = {|
  body: string,
  estimatedCost: number,
  officialResponse: string,
  status: Decision,
  validate?: boolean,
  goBack?: boolean,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal, onValidate } = props;
  onValidate(values.validate && values.status ? 'SAVING' : 'DRAFT_SAVING');
  const input = {
    proposalId: proposal.id,
    body: values.body,
    estimatedCost: values.estimatedCost,
    officialResponse: values.officialResponse,
  };
  if (values.validate && values.status) {
    return EvaluateProposalAssessmentMutation.commit({
      input: { ...input, decision: values.status, officialResponse: values.officialResponse || '' },
    })
      .then(() => {
        onValidate('SAVED', values.goBack);
      })
      .catch(e => {
        if (e instanceof SubmissionError) {
          throw e;
        }
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }
  return ChangeProposalAssessmentMutation.commit({
    input,
  })
    .then(() => {
      onValidate('DRAFT_SAVED');
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

const formName = 'proposal-assessment-form';

export const ProposalAssessmentFormPanel = ({
  dispatch,
  initialStatus,
  costEstimationEnabled,
  disabled,
  proposal,
  officialResponse,
  proposalRevisionsEnabled,
}: Props) => {
  const [status, setStatus] = useState(initialStatus);
  const { width } = useResize();
  const isLarge = width < bootstrapGrid.mdMax;
  return (
    <>
      <form id={formName}>
        {proposalRevisionsEnabled && <ProposalRevisionPanel proposal={proposal} />}
        <AnalysisForm>
          <Field
            name="body"
            component={component}
            type="textarea"
            id="proposalAssessment-boddy"
            autoComplete="off"
            label={<FormattedMessage id="admin.fields.comment_vote.comment" />}
          />

          {costEstimationEnabled && (
            <>
              <label className="mb-15">
                <FormattedMessage id="proposal.estimation" />
              </label>
              <InputGroup
                className="form-fields mb-10"
                bsClass="input-group"
                style={{ zIndex: '1' }}>
                <InputGroup.Addon>
                  <Glyphicon glyph="euro" />
                </InputGroup.Addon>
                <Field
                  component={component}
                  type="number"
                  min={0}
                  id="proposalAssessment-estimatedCost"
                  name="estimatedCost"
                  normalize={val => val && parseFloat(val)}
                />
              </InputGroup>
            </>
          )}

          <Field
            type="editor"
            name="officialResponse"
            id="proposalAssessment-officialResponse"
            label={<FormattedMessage id="official.reply.draft" />}
            component={component}
          />
        </AnalysisForm>
        <Validation isLarge={isLarge}>
          <Field
            onChange={() => setStatus('FAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            label={<FormattedMessage id="global.review" />}
            component={component}
            id="status-FAVOURABLE"
            name="status"
            type="radio"
            value="FAVOURABLE"
            radioChecked={status === true}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={12}
              color={colors.lightGreen}
              iconName={ICON_NAME.favorable}
              text="global.favorable"
            />
          </Field>
          <Field
            onChange={() => setStatus('UNFAVOURABLE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            component={component}
            id="status-UNFAVOURABLE"
            name="status"
            type="radio"
            value="UNFAVOURABLE"
            radioChecked={status === false}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={10}
              color={colors.dangerColor}
              iconName={ICON_NAME.unfavorable}
              text="global.filter-unfavourable"
            />
          </Field>
          <ValidateButton
            id="validate-proposal-assessment-button"
            disabled={disabled || (!status && !initialStatus) || !officialResponse}
            type="button"
            onClick={() => {
              dispatch(change(formName, 'validate', true));
              dispatch(change(formName, 'goBack', true));
            }}>
            <FormattedMessage id="validate" />
          </ValidateButton>
          {proposalRevisionsEnabled && (
            <ProposalRevision proposal={proposal}>
              {openModal => (
                <RevisionButton onClick={openModal} id="proposal-analysis-revision" type="button">
                  <FormattedMessage id="request.author.review" />
                </RevisionButton>
              )}
            </ProposalRevision>
          )}
        </Validation>
      </form>
    </>
  );
};

const mapStateToProps = (state: GlobalState, { proposal }: Props) => {
  const initialStatusValue = formValueSelector(formName)(state, 'status');
  return {
    initialValues: {
      status: proposal.assessment?.state || null,
      estimatedCost: proposal.assessment?.estimatedCost || null,
      body: proposal.assessment?.body || null,
      officialResponse: proposal.assessment?.officialResponse || null,
      validate: proposal.assessment?.state !== 'IN_PROGRESS',
    },
    proposalRevisionsEnabled: state.default.features.proposal_revisions ?? false,
    costEstimationEnabled: proposal.form?.analysisConfiguration?.costEstimationEnabled || false,
    initialStatus: initialStatusValue !== 'IN_PROGRESS' ? initialStatusValue : null,
    officialResponse: formValueSelector(formName)(state, 'officialResponse'),
  };
};

const form = reduxForm({
  form: formName,
  onChange: debounce(onSubmit, 1000),
  onSubmit,
})(ProposalAssessmentFormPanel);

const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAssessmentFormPanel_proposal on Proposal
      @argumentDefinitions(proposalRevisionsEnabled: { type: "Boolean!" }) {
      id
      ...ProposalRevisionPanel_proposal @include(if: $proposalRevisionsEnabled)
      ...ProposalRevision_proposal @include(if: $proposalRevisionsEnabled)
      assessment {
        id
        state
        estimatedCost
        body
        officialResponse
      }
      form {
        analysisConfiguration {
          costEstimationEnabled
        }
      }
    }
  `,
});
