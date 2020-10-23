// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { HelpBlock } from 'react-bootstrap';
import { useIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Field, change } from 'redux-form';
import toggle from '~/components/Form/Toggle';
import component from '~/components/Form/Field';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import { VoteFieldContainer } from './ProjectAdminStepForm.style';
import type { FeatureToggles, State, Dispatch } from '~/types';

type Props = {|
  ...ReduxFormFieldArrayProps,
  dispatch: Dispatch,
  features: FeatureToggles,
  stepFormName: string,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isLimitEnabled: boolean,
  options: {| ranking?: boolean, min: ?number, limit: ?number |},
|};

export function StepVotesFields({
  features,
  votable,
  dispatch,
  isBudgetEnabled,
  isTresholdEnabled,
  isLimitEnabled,
  stepFormName,
  options,
}: Props) {
  const [votesMinState, setVotesMinState] = useState(options.min || 1);
  const [votesLimitState, setVotesLimitState] = useState(options.limit || 3);
  const [votesRankingState, setVotesRankingState] = useState(options.ranking || false);
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
          <span className="excerpt">
            <FormattedMessage id="bo-vote-help" />
          </span>
          <div className="vote-fields">
            <div className="mr-30">
              <Field
                component={toggle}
                labelSide="LEFT"
                id="step-isBudgetEnabled"
                name="isBudgetEnabled"
                normalize={val => !!val}
                roledescription={<FormattedMessage id="budget-help" />}
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
                labelSide="LEFT"
                id="step-isTresholdEnabled"
                name="isTresholdEnabled"
                normalize={val => !!val}
                roledescription={<FormattedMessage id="ceil-help" />}
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
                icons
                component={toggle}
                labelSide="LEFT"
                id="step-isLimitEnabled"
                name="isLimitEnabled"
                normalize={val => !!val}
                label={<FormattedMessage id="Number-of-votes-per-person" />}
                roledescription={<FormattedMessage id="vote-classement-help" />}
              />
              {isLimitEnabled && (
                <div>
                  <div className="d-flex">
                    {features.votes_min && (
                      <div className="mr-30 vote-min">
                        <Field
                          type="number"
                          min={1}
                          parse={value => Number(value)}
                          value={votesMinState}
                          name="votesMin"
                          id="step-votesMin"
                          label={<FormattedMessage id="global-minimum-full" />}
                          component={component}
                          onChange={e => {
                            if (
                              votesRankingState &&
                              parseInt(e.target.value, 10) > parseInt(votesLimitState, 10)
                            ) {
                              setVotesLimitState(parseInt(e.target.value, 10));
                              dispatch(
                                change(stepFormName, 'votesLimit', parseInt(e.target.value, 10)),
                              );
                            }
                            setVotesMinState(parseInt(e.target.value, 10));
                          }}
                        />
                      </div>
                    )}
                    <Field
                      type="number"
                      min={1}
                      parse={value => Number(value)}
                      name="votesLimit"
                      id="step-votesLimit"
                      value={votesLimitState}
                      label={<FormattedMessage id="maximum-vote" />}
                      component={component}
                      onChange={e => {
                        if (
                          features.votes_min &&
                          parseInt(e.target.value, 10) < parseInt(votesMinState, 10)
                        ) {
                          setVotesMinState(e.target.value);
                          dispatch(change(stepFormName, 'votesMin', parseInt(e.target.value, 10)));
                        }
                        // eslint-disable-next-line no-restricted-globals
                        if (!features.votes_min && isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(3);
                          dispatch(change(stepFormName, 'votesLimit', 3));
                        } else if (Number.isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(0);
                        } else {
                          setVotesLimitState(parseInt(e.target.value, 10));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Field
                      className="m-0"
                      type="checkbox"
                      wrapperClassName="checkbox"
                      component={component}
                      id="step-votesRanking"
                      name="votesRanking"
                      children={<FormattedMessage id="activate-vote-ranking" />}
                      groupClassName="m-0"
                      globalClassName="m-0"
                      labelClassName="m-0"
                      onChange={e => {
                        setVotesRankingState(e.target.checked);
                        if (
                          e.target.checked &&
                          features.votes_min &&
                          votesMinState &&
                          (Number.isNaN(votesLimitState) || votesLimitState < votesMinState)
                        ) {
                          dispatch(change(stepFormName, 'votesLimit', votesMinState));
                          setVotesMinState(parseInt(votesMinState, 10));
                          setVotesLimitState(parseInt(votesMinState, 10));
                        } else if (e.target.checked) {
                          if (!votesLimitState || votesLimitState === 0) {
                            dispatch(change(stepFormName, 'votesLimit', 3));
                            setVotesLimitState(3);
                          }
                          if (
                            (features.votes_min && !votesMinState) ||
                            votesMinState === 0 ||
                            votesMinState === 1
                          ) {
                            dispatch(change(stepFormName, 'votesMin', 1));
                            setVotesMinState(1);
                          }
                        }
                      }}
                    />
                    <HelpBlock className="excerpt">
                      <FormattedHTMLMessage id="help-text-vote-ranking" />
                    </HelpBlock>
                    {votesRankingState && (
                      <strong>
                        <FormattedMessage
                          id="help-vote-point"
                          values={{ points: votesLimitState }}
                        />
                      </strong>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Field
                type="editor"
                name="votesHelpText"
                id="step-votesHelpText"
                label={renderLabel('admin.fields.step.votesHelpText', intl)}
                component={component}
                help={<FormattedMessage id="vote-help" />}
              />
            </div>
          </div>
        </VoteFieldContainer>
      )}
    </>
  );
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(StepVotesFields);
