// @flow
import React, { useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import debounce from 'lodash/debounce';
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
import type {
  ProposalAnalysisFormPanel_proposal,
  ProposalAnalysisState,
} from '~relay/ProposalAnalysisFormPanel_proposal.graphql';
import colors from '~/utils/colors';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import type { GlobalState } from '~/types';
import sizes from '~/utils/sizes';
import { CloseIcon } from './ProposalAnalysisPanel';
import formatSubmitResponses from '~/utils/form/formatSubmitResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import renderResponses from '~/components/Form/RenderResponses';
import type { ResponsesInReduxForm } from '~/components/Form/Form.type';
import component from '~/components/Form/Field';
import ProposalAnalysisStatusLabel from './ProposalAnalysisStatusLabel';
import ChangeProposalAnalysisMutation from '~/mutations/ChangeProposalAnalysisMutation';
import AnalyseProposalAnalysisMutation from '~/mutations/AnalyseProposalAnalysisMutation';

import { TYPE_FORM } from '~/constants/FormConstants';

const FormPanel: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  overflow: scroll;
  height: calc(100vh - 70px);

  textarea {
    resize: none;
  }
`;

const Header: StyledComponent<{ isLarge: boolean }, {}, HTMLDivElement> = styled.div`
  position: fixed;
  z-index: 1;
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};
`;

const Top: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
  font-size: 16px;
  font-weight: 600;
  color: ${colors.darkText};
  padding: 20px;
  text-align: center;
  z-index: 1;
  background: ${colors.white};

  > svg:hover {
    cursor: pointer;
  }

  span {
    max-width: 80%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const memoizeAvailableQuestions: any = memoize(() => {});

const DataStatus: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  height: 30px;
  background: ${colors.grayF4};
  text-align: center;
  font-size: 14px;
  padding: 5px;
  color: ${colors.darkGray};
`;

const Validation: StyledComponent<{ isLarge: boolean }, {}, HTMLDivElement> = styled.div`
  width: ${props => `calc(100vw - (100vw - (45vw - (${props.isLarge ? '95px' : '120px'}))));`};
  background: ${colors.grayF4};
  height: 365px;
  padding: 20px;

  .form-group .radio-container label {
    align-items: center;
  }
`;

const AnalysisForm: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  margin-top: 100px;
  overflow: scroll;
  padding: 20px;
  background: ${colors.white};
`;

const ValidateButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  width: 100%;
  height: 40px;
  text-align: center;
  background: #3b88fd;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.white};
  border-radius: 3px;
  border: none;
`;

type Props = {|
  ...ReduxFormFormProps,
  proposal: ProposalAnalysisFormPanel_proposal,
  onClose: () => void,
  userId: string,
  onBackClick: () => void,
  disabled?: boolean,
  userId: string,
  displayName: string,
  responses: ResponsesInReduxForm,
  initialStatus: ProposalAnalysisState,
|};

type Decision = 'FAVOURABLE' | 'UNFAVOURABLE' | 'NONE';

export type FormValues = {|
  responses: ResponsesInReduxForm,
  comment: string,
  status: ?Decision,
  validate: boolean,
|};

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const { proposal } = props;
  const input = {
    responses: formatSubmitResponses(
      values.responses,
      proposal?.form?.analysisConfiguration?.evaluationForm?.questions || [],
    ),
    proposalId: proposal.id,
    comment: values.comment,
  };
  if (values.validate && values.status) {
    return AnalyseProposalAnalysisMutation.commit({
      input: { ...input, decision: values.status },
    }).catch(e => {
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
  }).catch(e => {
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
  onClose,
  proposal,
  onBackClick,
  displayName,
  dispatch,
  initialStatus,
  responses,
  change: changeProps,
  submitting,
  disabled,
}: Props) => {
  const intl = useIntl();
  const [status, setStatus] = useState(initialStatus);
  const { width } = useResize();
  const isLarge = width < sizes.bootstrapGrid.mdMax;
  const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
    'availableQuestions',
  );
  return (
    <FormPanel>
      <Header isLarge={isLarge}>
        <Top>
          <Icon
            onClick={onBackClick}
            name={ICON_NAME.chevronLeft}
            size={14}
            color={colors.primaryColor}
          />
          <span>{displayName}</span>
          <CloseIcon onClose={onClose} />
        </Top>
        <DataStatus>
          {disabled ? (
            <ProposalAnalysisStatusLabel
              fontSize={8}
              iconSize={7}
              color={colors.secondaryGray}
              iconName={ICON_NAME.clock}
              text="global.filter_belated"
            />
          ) : (
            <FormattedMessage id={submitting ? 'global.saving' : 'all.data.saved'} />
          )}
        </DataStatus>
      </Header>
      <form id="proposal-analysis-form" style={{ opacity: disabled ? '0.5' : '1' }}>
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
            disabled={disabled || !status}
            type="button"
            onClick={() => {
              dispatch(change(formName, 'validate', true));
            }}>
            <FormattedMessage id="validate" />
          </ValidateButton>
        </Validation>
      </form>
    </FormPanel>
  );
};

const mapStateToProps = (state: GlobalState, { proposal, userId }: Props) => {
  const analysis = proposal.analyses?.find(a => a.updatedBy.id === userId);
  const initialResponses = analysis?.responses;
  const defaultResponses = formatInitialResponsesValues(
    proposal?.form?.analysisConfiguration?.evaluationForm?.questions || [],
    initialResponses || [],
  );
  return {
    initialValues: {
      responses: defaultResponses,
      comment: analysis?.comment,
      status: analysis?.state,
      validate: analysis?.state !== 'IN_PROGRESS',
    },
    displayName: analysis?.updatedBy?.displayName,
    responses: formValueSelector(formName)(state, 'responses') || defaultResponses,
    initialStatus: formValueSelector(formName)(state, 'status') || null,
  };
};

const form = reduxForm({
  form: formName,
  validate: null,
  onChange: debounce(onSubmit, 500),
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
          displayName
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
