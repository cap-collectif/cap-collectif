// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useResize } from '@liinkiing/react-hooks';
import styled, { type StyledComponent } from 'styled-components';
import memoize from 'lodash/memoize';
import {
  reduxForm,
  FieldArray,
  formValueSelector,
  change,
  Field,
  SubmissionError,
} from 'redux-form';
import debounce from 'debounce-promise';
import type {
  ProposalAnalysisFormPanel_proposal,
  ProposalAnalysisState,
} from '~relay/ProposalAnalysisFormPanel_proposal.graphql';
import colors from '~/utils/colors';
import { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { GlobalState } from '~/types';
import { bootstrapGrid } from '~/utils/sizes';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import renderResponses from '~/components/Form/RenderResponses';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import component from '~/components/Form/Field';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import ChangeProposalAnalysisMutation from '~/mutations/ChangeProposalAnalysisMutation';
import AnalyseProposalAnalysisMutation from '~/mutations/AnalyseProposalAnalysisMutation';

import { TYPE_FORM } from '~/constants/FormConstants';

const memoizeAvailableQuestions: any = memoize(() => {});

export const Validation: StyledComponent<{ isLarge: boolean }, {}, HTMLDivElement> = styled.div`
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};
  background: ${colors.grayF4};
  height: 365px;
  padding: 20px;

  .form-group .radio-container label {
    align-items: center;
  }

  > p {
    margin-bottom: 20px;
    font-size: 16px;
  }
`;

export const AnalysisForm: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 100px;
  overflow: scroll;
  padding: 20px;
  background: ${colors.white};
`;

export const ValidateButton: StyledComponent<
  { disabled?: boolean },
  {},
  HTMLButtonElement,
> = styled.button`
  width: 100%;
  height: 40px;
  text-align: center;
  background: #3b88fd;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.white};
  border-radius: 3px;
  border: none;
  opacity: ${({ disabled }) => disabled && '0.5'};
`;

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalAnalysisFormPanel_proposal,
  disabled?: boolean,
  responses: ResponsesInReduxForm,
  initialStatus: ProposalAnalysisState,
  userId: string,
  onValidate: (boolean, ?boolean) => void,
|};

type Decision = 'FAVOURABLE' | 'UNFAVOURABLE' | 'NONE';

export type FormValues = {|
  responses: ResponsesInReduxForm,
  comment: string,
  status: ?Decision,
  validate: boolean,
  goBack?: boolean,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal, onValidate } = props;
  onValidate(true);
  const input = {
    responses: formatSubmitResponses(
      values.responses,
      proposal?.form?.analysisConfiguration?.evaluationForm?.questions || [],
    ),
    proposalId: proposal.id,
    comment: values.comment || '',
  };
  if (values.validate && values.status) {
    return AnalyseProposalAnalysisMutation.commit({
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
  return ChangeProposalAnalysisMutation.commit({
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

const formName = 'proposal-analysis-form';

export const ProposalAnalysisFormPanel = ({
  proposal,
  dispatch,
  initialStatus,
  responses,
  change: changeProps,
  disabled,
}: Props) => {
  const intl = useIntl();
  const [status, setStatus] = useState(initialStatus);
  const { width } = useResize();
  const isLarge = width < bootstrapGrid.mdMax;
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    'availableQuestions',
  );
  return (
    <>
      <form id={formName} style={{ opacity: disabled ? '0.5' : '1' }}>
        <AnalysisForm>
          <FieldArray
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            name="responses"
            component={renderResponses}
            form={formName}
            dispatch={dispatch}
            questions={proposal?.form?.analysisConfiguration?.evaluationForm?.questions}
            intl={intl}
            change={changeProps}
            responses={responses}
            availableQuestions={availableQuestions}
            memoize={memoizeAvailableQuestions}
            disabled={disabled}
          />
        </AnalysisForm>
        <Validation isLarge={isLarge}>
          <Field
            disabled={disabled}
            name="comment"
            component={component}
            type="textarea"
            id="proposalAnalysis-comment"
            autoComplete="off"
            label={<FormattedMessage id="admin.fields.comment_vote.comment" />}
          />
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
            radioChecked={status === 'FAVOURABLE'}>
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
            radioChecked={status === 'UNFAVOURABLE'}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={10}
              color={colors.dangerColor}
              iconName={ICON_NAME.unfavorable}
              text="global.filter-unfavourable"
            />
          </Field>
          <Field
            onChange={() => setStatus('NONE')}
            typeForm={TYPE_FORM.QUESTIONNAIRE}
            disabled={disabled}
            component={component}
            id="status-NONE"
            name="status"
            type="radio"
            value="NONE"
            radioChecked={status === 'NONE'}>
            <ProposalAnalysisStatusLabel
              fontSize={14}
              iconSize={12}
              color={colors.duckBlue}
              iconName={ICON_NAME.silent}
              text="global.filter_not-pronounced"
            />
          </Field>
          <ValidateButton
            id="validate-proposal-analysis-button"
            disabled={disabled || (!status && !initialStatus)}
            type="button"
            onClick={() => {
              dispatch(change(formName, 'validate', true));
              dispatch(change(formName, 'goBack', true));
            }}>
            <FormattedMessage id="global.finish" />
          </ValidateButton>
        </Validation>
      </form>
    </>
  );
};

const mapStateToProps = (state: GlobalState, { proposal, userId }: Props) => {
  const analysis = proposal.analyses?.find(a => a.updatedBy.id === userId);
  const initialResponses = analysis?.responses;
  const defaultResponses = formatInitialResponsesValues(
    proposal?.form?.analysisConfiguration?.evaluationForm?.questions || [],
    initialResponses || [],
  );
  const initialStatusValue = formValueSelector(formName)(state, 'status');
  return {
    initialValues: {
      responses: defaultResponses,
      comment: analysis?.comment,
      status: analysis?.state,
      validate: analysis && analysis.state !== 'IN_PROGRESS',
    },
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
    initialStatus: initialStatusValue !== 'IN_PROGRESS' ? initialStatusValue : null,
  };
};

const form = reduxForm({
  form: formName,
  validate: null,
  onChange: debounce(onSubmit, 1000),
  onSubmit,
})(ProposalAnalysisFormPanel);

const container = connect(mapStateToProps)(injectIntl(form));

export default createFragmentContainer(container, {
  proposal: graphql`
    fragment ProposalAnalysisFormPanel_proposal on Proposal {
      id
      analyses {
        id
        updatedBy {
          id
        }
        comment
        state
        responses {
          ...responsesHelper_response @relay(mask: false)
        }
      }
      form {
        analysisConfiguration {
          id
          evaluationForm {
            questions {
              id
              ...responsesHelper_question @relay(mask: false)
            }
          }
        }
      }
    }
  `,
});
