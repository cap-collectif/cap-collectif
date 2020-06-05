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
import type { GlobalState } from '~/types';
import sizes from '~/utils/sizes';
import component from '~/components/Form/Field';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import { TYPE_FORM } from '~/constants/FormConstants';
import { Validation, ValidateButton, AnalysisForm } from './ProposalAnalysisFormPanel';
import ChangeProposalAssessmentMutation from '~/mutations/ChangeProposalAssessmentMutation';
import EvaluateProposalAssessmentMutation from '~/mutations/EvaluateProposalAssessmentMutation';

type Decision = 'FAVOURABLE' | 'UNFAVOURABLE';

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalAssessmentFormPanel_proposal,
  disabled?: boolean,
  initialStatus: Decision,
  onValidate: (boolean, ?boolean) => void,
  costEstimationEnabled: boolean,
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
  onValidate(true);
  const input = {
    proposalId: proposal.id,
    body: values.body,
    estimatedCost: values.estimatedCost,
    officialResponse: values.officialResponse,
  };
  if (values.validate && values.status) {
    return EvaluateProposalAssessmentMutation.commit({
      input: { ...input, decision: values.status },
    })
      .then(() => {
        onValidate(false, values.goBack);
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
      onValidate(false);
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
}: Props) => {
  const [status, setStatus] = useState(initialStatus);
  const { width } = useResize();
  const isLarge = width < sizes.bootstrapGrid.mdMax;
  return (
    <>
      <form id={formName}>
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
            disabled={disabled || (!status && !initialStatus)}
            type="button"
            onClick={() => {
              dispatch(change(formName, 'validate', true));
              dispatch(change(formName, 'goBack', true));
            }}>
            <FormattedMessage id="validate" />
          </ValidateButton>
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
    costEstimationEnabled: proposal.form?.analysisConfiguration?.costEstimationEnabled || false,
    initialStatus: initialStatusValue !== 'IN_PROGRESS' ? initialStatusValue : null,
  };
};

const form = reduxForm({
  form: formName,
  validate: null,
  onChange: debounce(onSubmit, 1000),
  onSubmit,
})(ProposalAssessmentFormPanel);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAssessmentFormPanel_proposal on Proposal {
      id
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
