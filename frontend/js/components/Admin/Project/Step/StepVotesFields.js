// @flow
import React from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import toggle from '~/components/Form/Toggle';
import component from '~/components/Form/Field';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import { VoteFieldContainer } from './ProjectAdminStepForm.style';

type Props = {|
  ...ReduxFormFieldArrayProps,
  dispatch: Dispatch,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
|};

export function StepVotesFields({
  votable,
  isBudgetEnabled,
  isTresholdEnabled,
  isLimitEnabled,
}: Props) {
  const intl = useIntl();
  return (
    <>
      <ProjectBoxHeader>
        <h5 className="d-flex align-items-center m-0 mb-15">
          <Field component={toggle} id="step-votable" name="votable" normalize={val => !!val} />
          <FormattedMessage id="project_download.values.content_type.vote" />
        </h5>
      </ProjectBoxHeader>
      {votable && (
        <VoteFieldContainer>
          <Field
            icons
            component={toggle}
            id="step-isLimitEnabled"
            name="isLimitEnabled"
            normalize={val => !!val}
            label={<FormattedMessage id="Number-of-votes-per-person" />}
          />
          {isLimitEnabled && (
            <Field
              type="number"
              min={0}
              name="votesLimit"
              id="step-votesLimit"
              label={<FormattedMessage id="maximum-vote" />}
              component={component}
            />
          )}
          <Field
            component={toggle}
            id="step-isTresholdEnabled"
            name="isTresholdEnabled"
            normalize={val => !!val}
            label={<FormattedMessage id="admin.fields.step.vote_threshold.input" />}
          />
          {isTresholdEnabled && (
            <Field
              type="number"
              min={0}
              name="voteThreshold"
              id="step-voteThreshold"
              component={component}
            />
          )}
          <Field
            component={toggle}
            id="step-isBudgetEnabled"
            name="isBudgetEnabled"
            normalize={val => !!val}
            label={<FormattedMessage id="maximum-budget" />}
          />
          {isBudgetEnabled && (
            <Field
              type="number"
              min={0}
              name="budget"
              step="any"
              id="step-budget"
              component={component}
            />
          )}
          <Field
            component={toggle}
            id="step-votesRanking"
            name="votesRanking"
            normalize={val => !!val}
            label={<FormattedMessage id="global.ranking" />}
          />
          <Field
            type="editor"
            name="votesHelpText"
            id="step-votesHelpText"
            label={renderLabel('admin.fields.step.votesHelpText', intl)}
            component={component}
          />
        </VoteFieldContainer>
      )}
    </>
  );
}

export default connect()(StepVotesFields);
