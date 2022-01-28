// @flow
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { useIntl, FormattedHTMLMessage } from 'react-intl';
import { Field, change } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import toggle from '~/components/Form/Toggle';
import component from '~/components/Form/Field';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';
import { renderLabel } from '../Content/ProjectContentAdminForm';
import { VoteFieldContainer } from './ProjectAdminStepForm.style';
import type { Dispatch } from '~/types';
import Flex from '~ui/Primitives/Layout/Flex';
import { styleGuideColors } from '~/utils/colors';
import AppBox from '~ui/Primitives/AppBox';
import Text from '~ui/Primitives/Text';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

type Props = {|
  ...ReduxFormFieldArrayProps,
  dispatch: Dispatch,
  stepFormName: string,
  votable: boolean,
  isBudgetEnabled: boolean,
  isTresholdEnabled: boolean,
  isSecretBallotEnabled: boolean,
  isLimitEnabled: boolean,
  options: {| ranking?: boolean, min: ?number, limit: ?number |},
|};

const FieldContainer: StyledComponent<{ toggled: boolean }, {}, typeof Flex> = styled(Flex)`
  .form-group {
    margin-bottom: 24px;
  }
  
    .toggle-container {
      .label-toggler {
        color: ${({ toggled }) => (toggled ? styleGuideColors.gray900 : styleGuideColors.gray600)}};
        font-weight: 600;
      }
    }
`;

export function StepVotesFields({
  votable,
  dispatch,
  isBudgetEnabled,
  isTresholdEnabled,
  isSecretBallotEnabled,
  isLimitEnabled,
  stepFormName,
  options,
}: Props) {
  const [votesMinState, setVotesMinState] = useState(options.min || 1);
  const [votesLimitState, setVotesLimitState] = useState(options.limit || 3);
  const [votesRankingState, setVotesRankingState] = useState(options.ranking || false);
  const intl = useIntl();
  const useVoteMin = useFeatureFlag('votes_min');

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
            label={intl.formatMessage({ id: 'project_download.values.content_type.vote' })}
          />
        </h5>
      </ProjectBoxHeader>
      {votable && (
        <VoteFieldContainer>
          <Text as="span" color="gray.500" maxWidth="790px">
            {intl.formatMessage({ id: 'bo-vote-help' })}
          </Text>
          <Flex className="vote-fields" justify="space-between">
            <AppBox maxWidth="50%" mr="79px">
              <FieldContainer toggled={isBudgetEnabled}>
                <Field
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isBudgetEnabled"
                  name="isBudgetEnabled"
                  normalize={val => !!val}
                  helpText={intl.formatMessage({ id: 'budget-help' })}
                  label={intl.formatMessage({ id: 'maximum-budget' })}
                />
              </FieldContainer>
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
              <FieldContainer toggled={isTresholdEnabled}>
                <Field
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isTresholdEnabled"
                  name="isTresholdEnabled"
                  normalize={val => !!val}
                  helpText={intl.formatMessage({ id: 'ceil-help' })}
                  label={intl.formatMessage({ id: 'admin.fields.step.vote_threshold.input' })}
                />
              </FieldContainer>

              {isTresholdEnabled && (
                <Field
                  type="number"
                  min={0}
                  name="voteThreshold"
                  id="step-voteThreshold"
                  component={component}
                />
              )}
              <FieldContainer toggled={isLimitEnabled}>
                <Field
                  icons
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isLimitEnabled"
                  name="isLimitEnabled"
                  normalize={val => !!val}
                  label={intl.formatMessage({ id: 'Number-of-votes-per-person' })}
                  helpText={intl.formatMessage({ id: 'vote-classement-help' })}
                />
              </FieldContainer>

              {isLimitEnabled && (
                <>
                  <Flex>
                    {useVoteMin && (
                      <div className="mr-30 vote-min">
                        <Field
                          type="number"
                          min={1}
                          parse={value => Number(value)}
                          value={votesMinState}
                          name="votesMin"
                          id="step-votesMin"
                          label={intl.formatMessage({ id: 'global-minimum-full' })}
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
                      label={intl.formatMessage({ id: 'maximum-vote' })}
                      component={component}
                      onChange={e => {
                        if (
                          useVoteMin &&
                          parseInt(e.target.value, 10) < parseInt(votesMinState, 10)
                        ) {
                          setVotesMinState(e.target.value);
                          dispatch(change(stepFormName, 'votesMin', parseInt(e.target.value, 10)));
                        }
                        // eslint-disable-next-line no-restricted-globals
                        if (!useVoteMin && isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(3);
                          dispatch(change(stepFormName, 'votesLimit', 3));
                        } else if (Number.isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(0);
                        } else {
                          setVotesLimitState(parseInt(e.target.value, 10));
                        }
                      }}
                    />
                  </Flex>
                  <>
                    <Field
                      className="m-0"
                      type="checkbox"
                      wrapperClassName="checkbox"
                      component={component}
                      id="step-votesRanking"
                      name="votesRanking"
                      groupClassName="m-0"
                      globalClassName="m-0"
                      labelClassName="m-0"
                      onChange={e => {
                        setVotesRankingState(e.target.checked);
                        if (
                          e.target.checked &&
                          useVoteMin &&
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
                            (useVoteMin && !votesMinState) ||
                            votesMinState === 0 ||
                            votesMinState === 1
                          ) {
                            dispatch(change(stepFormName, 'votesMin', 1));
                            setVotesMinState(1);
                          }
                        }
                      }}>
                      {intl.formatMessage({ id: 'activate-vote-ranking' })}
                    </Field>
                    <Flex
                      as="span"
                      marginTop="8px"
                      fontWeight="400"
                      color="gray.700"
                      marginBottom={votesRankingState ? '0' : '24px'}
                      className="clear">
                      <FormattedHTMLMessage id="help-text-vote-ranking" />
                    </Flex>
                    {votesRankingState && (
                      <Flex as="span" marginBottom="24px">
                        <br />
                        <strong>
                          {intl.formatMessage(
                            { id: 'help-vote-point' },
                            { points: votesLimitState },
                          )}
                        </strong>
                      </Flex>
                    )}
                  </>
                </>
              )}
                  <FieldContainer toggled={isSecretBallotEnabled}>
                    <Field
                      component={toggle}
                      labelSide="LEFT"
                      id="step-secretBallot"
                      name="isSecretBallot"
                      className="toggle-secret-ballot"
                      normalize={val => !!val}
                      helpText={intl.formatMessage({ id: 'secret-ballot-body' })}
                      label={intl.formatMessage({ id: 'secret-ballot' })}
                    />
                  </FieldContainer>
                  {isSecretBallotEnabled && (
                    <Field
                      id="step-publishedVoteDate"
                      component={component}
                      type="datetime"
                      name="publishedVoteDate"
                      label={renderLabel('published-vote-date', intl, undefined, true, '400')}
                      addonAfter={<i className="cap-calendar-2" />}
                    />
                  )}
            </AppBox>
            <AppBox maxWidth="50%">
              <Field
                type="editor"
                name="votesHelpText"
                id="step-votesHelpText"
                label={renderLabel('admin.fields.step.votesHelpText', intl)}
                component={component}
                help={intl.formatMessage({ id: 'vote-help' })}
              />
            </AppBox>
          </Flex>
        </VoteFieldContainer>
      )}
    </>
  );
}

export default connect<any, any, _, _, _, _>()(StepVotesFields);
