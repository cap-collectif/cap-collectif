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
import type { FeatureToggles, State } from '~/types';

type Props = {|
  ...ReduxFormFieldArrayProps,
  dispatch: Dispatch,
  features: FeatureToggles,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
|};

export function StepVotesFields({
  features,
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
          <Field
            bold
            id="step-votable"
            component={toggle}
            name="votable"
            normalize={val => !!val}
            label={<FormattedMessage id="project_download.values.content_type.vote" />}
          />
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
            <div className="d-flex">
              {features.votes_min && (
                <div className="mr-30">
                  <Field
                    type="number"
                    min={1}
                    parse={value => Number(value)}
                    name="votesMin"
                    id="step-votesMin"
                    label={<FormattedMessage id="global-minimum-full" />}
                    component={component}
                  />
                </div>
              )}
              <Field
                type="number"
                min={1}
                parse={value => Number(value)}
                name="votesLimit"
                id="step-votesLimit"
                label={<FormattedMessage id="maximum-vote" />}
                component={component}
              />
            </div>
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
const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(StepVotesFields);
