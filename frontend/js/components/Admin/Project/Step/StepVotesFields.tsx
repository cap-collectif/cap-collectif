import React, { useState } from 'react'
import { connect, useSelector } from 'react-redux'
import { useIntl, FormattedHTMLMessage } from 'react-intl'
import { Field, change, formValueSelector, getFormValues } from 'redux-form'
import styled from 'styled-components'
import toggle from '~/components/Form/Toggle'
import component from '~/components/Form/Field'
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style'
import { renderLabel } from '../Content/ProjectContentAdminForm'
import { VoteFieldContainer } from './ProjectAdminStepForm.style'
import type { Dispatch, GlobalState } from '~/types'
import Flex from '~ui/Primitives/Layout/Flex'
import { styleGuideColors } from '~/utils/colors'
import AppBox from '~ui/Primitives/AppBox'
import Text from '~ui/Primitives/Text'
import Tooltip from '~ds/Tooltip/Tooltip'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import TeaserServices from './TeaserServices'
import select from '~/components/Form/Select'

type Props = ReduxFormFieldArrayProps & {
  dispatch: Dispatch
  stepFormName: string
  votable: boolean
  isBudgetEnabled: boolean
  isProposalSmsVoteEnabled: boolean
  hasEnabledFeaturesToVoteBySms: boolean
  isTresholdEnabled: boolean
  isSecretBallotEnabled: boolean
  isLimitEnabled: boolean
  options: {
    ranking?: boolean
    min: number | null | undefined
    limit: number | null | undefined
  }
  endAt: string | null | undefined
}
const FieldContainer = styled(Flex)<{
  toggled: boolean
}>`
  .form-group {
    margin-bottom: 24px;
  }
  
    .toggle-container {
      .label-toggler {
        color: ${({ toggled }) => (toggled ? styleGuideColors.gray900 : styleGuideColors.gray600)}};
        font-weight: 600;
      }
    }
`
export function StepVotesFields(
  {
    votable,
    dispatch,
    isBudgetEnabled,
    isProposalSmsVoteEnabled,
    hasEnabledFeaturesToVoteBySms,
    isTresholdEnabled,
    isSecretBallotEnabled,
    isLimitEnabled,
    stepFormName,
    options,
    endAt,
  }: Props,
  state: GlobalState,
) {
  const [votesMinState, setVotesMinState] = useState(options.min || 1)
  const [votesLimitState, setVotesLimitState] = useState(options.limit || 3)
  const [votesRankingState, setVotesRankingState] = useState(options.ranking || false)
  const intl = useIntl()
  const useVoteMin = useFeatureFlag('votes_min')
  const hasFeatureTwilio = useFeatureFlag('twilio')
  const { steps, currentStep } = useSelector((globalState: GlobalState) => {
    return {
      steps: formValueSelector('projectAdminForm')(globalState, 'steps'),
      currentStep: getFormValues(stepFormName)(globalState),
    }
  })
  const stepWithProposalArchivedConfigured = steps.find(step => step.proposalArchivedTime > 0)
  const [canConfigureProposalArchived] = React.useState(() => {
    if (!stepWithProposalArchivedConfigured) {
      return true
    }

    return stepWithProposalArchivedConfigured?.proposalArchivedTime === currentStep?.proposalArchivedTime
  })
  const voteSmsEnabled = hasEnabledFeaturesToVoteBySms && isProposalSmsVoteEnabled
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
            label={intl.formatMessage({
              id: 'project_download.values.content_type.vote',
            })}
          />
        </h5>
      </ProjectBoxHeader>
      {votable && (
        <VoteFieldContainer>
          <Text as="span" color="gray.500" maxWidth="790px">
            {intl.formatMessage({
              id: 'bo-vote-help',
            })}
          </Text>
          <Flex className="vote-fields" justify="space-between">
            <AppBox maxWidth="50%" mr="79px">
              {hasEnabledFeaturesToVoteBySms && (
                <FieldContainer toggled={isProposalSmsVoteEnabled}>
                  <Field
                    component={toggle}
                    labelSide="LEFT"
                    id="step-isProposalSmsVoteEnabled"
                    name="isProposalSmsVoteEnabled"
                    normalize={val => !!val}
                    helpText={intl.formatMessage({
                      id: 'vote-without-account-help',
                    })}
                    label={intl.formatMessage({
                      id: 'vote-without-account',
                    })}
                    onChange={e => {
                      const { checked } = e.target

                      if (checked) {
                        dispatch(change(stepFormName, 'isBudgetEnabled', false))
                        dispatch(change(stepFormName, 'budget', null))
                        dispatch(change(stepFormName, 'isTresholdEnabled', false))
                        dispatch(change(stepFormName, 'voteThreshold', null))
                        dispatch(change(stepFormName, 'votesRanking', false))
                        dispatch(change(stepFormName, 'votesMin', null))
                      }
                    }}
                  />
                </FieldContainer>
              )}
              <FieldContainer toggled={isBudgetEnabled}>
                <Field
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isBudgetEnabled"
                  name="isBudgetEnabled"
                  normalize={val => !!val}
                  helpText={intl.formatMessage({
                    id: 'budget-help',
                  })}
                  label={intl.formatMessage({
                    id: 'maximum-budget',
                  })}
                  disabled={voteSmsEnabled}
                />
              </FieldContainer>
              {isBudgetEnabled && (
                <Field type="number" min={0} name="budget" step="any" id="step-budget" component={component} />
              )}
              <FieldContainer toggled={isTresholdEnabled}>
                <Field
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isTresholdEnabled"
                  name="isTresholdEnabled"
                  normalize={val => !!val}
                  helpText={intl.formatMessage({
                    id: 'ceil-help',
                  })}
                  label={intl.formatMessage({
                    id: 'admin.fields.step.vote_threshold.input',
                  })}
                  disabled={voteSmsEnabled}
                  onChange={e => {
                    if (!e.target.checked) {
                      dispatch(change(stepFormName, 'proposalArchivedTime', 0))
                    }
                  }}
                />
              </FieldContainer>

              {isTresholdEnabled && (
                <>
                  <Field type="number" min={0} name="voteThreshold" id="step-voteThreshold" component={component} />
                  <AppBox>
                    <Flex alignItems="center" color={!canConfigureProposalArchived ? 'gray.500' : 'inherit'}>
                      <Text>
                        {intl.formatMessage({
                          id: 'automatic-archiving',
                        })}
                      </Text>
                      <Tooltip
                        label={intl.formatMessage({
                          id: 'archive-proposals-help-text',
                        })}
                      >
                        <AppBox>
                          <Icon name={ICON_NAME.CIRCLE_INFO} size={ICON_SIZE.MD} color="blue.500" />
                        </AppBox>
                      </Tooltip>
                    </Flex>
                    <Flex alignItems="center" spacing="4">
                      <Field
                        type="number"
                        min={0}
                        name="proposalArchivedTime"
                        id="step-proposalArchivedTime"
                        component={component}
                        disabled={!canConfigureProposalArchived}
                      />
                      <AppBox width="100px">
                        <Field
                          component={select}
                          name="proposalArchivedUnitTime"
                          id="step-proposalArchivedUnitTime"
                          options={[
                            {
                              label: intl.formatMessage({
                                id: 'global.days',
                              }),
                              value: 'DAYS',
                            },
                            {
                              label: intl.formatMessage({
                                id: 'global.months',
                              }),
                              value: 'MONTHS',
                            },
                          ]}
                          clearable={false}
                          disabled={!canConfigureProposalArchived}
                        />
                      </AppBox>
                    </Flex>
                  </AppBox>
                  {!canConfigureProposalArchived && stepWithProposalArchivedConfigured && (
                    <Text mb={4} color="gray.400">
                      {intl.formatMessage(
                        {
                          id: 'archiving-already-configured-in-step',
                        },
                        {
                          stepTitle: stepWithProposalArchivedConfigured.title,
                        },
                      )}
                    </Text>
                  )}
                </>
              )}
              <FieldContainer toggled={isLimitEnabled}>
                <Field
                  icons
                  component={toggle}
                  labelSide="LEFT"
                  id="step-isLimitEnabled"
                  name="isLimitEnabled"
                  normalize={val => !!val}
                  label={intl.formatMessage({
                    id: 'Number-of-votes-per-person',
                  })}
                  helpText={intl.formatMessage({
                    id: 'vote-classement-help',
                  })}
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
                          label={intl.formatMessage({
                            id: 'global-minimum-full',
                          })}
                          component={component}
                          disabled={voteSmsEnabled}
                          onChange={e => {
                            if (
                              votesRankingState &&
                              parseInt(e.target.value, 10) > parseInt(votesLimitState as unknown as string, 10)
                            ) {
                              setVotesLimitState(parseInt(e.target.value, 10))
                              dispatch(change(stepFormName, 'votesLimit', parseInt(e.target.value, 10)))
                            }

                            setVotesMinState(parseInt(e.target.value, 10))
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
                      label={intl.formatMessage({
                        id: 'maximum-vote',
                      })}
                      component={component}
                      onChange={e => {
                        if (
                          useVoteMin &&
                          parseInt(e.target.value, 10) < parseInt(votesMinState as unknown as string, 10)
                        ) {
                          setVotesMinState(e.target.value)
                          dispatch(change(stepFormName, 'votesMin', parseInt(e.target.value, 10)))
                        }

                        if (!useVoteMin && isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(3)
                          dispatch(change(stepFormName, 'votesLimit', 3))
                        } else if (Number.isNaN(parseInt(e.target.value, 10))) {
                          setVotesLimitState(0)
                        } else {
                          setVotesLimitState(parseInt(e.target.value, 10))
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
                      disabled={voteSmsEnabled}
                      onChange={e => {
                        setVotesRankingState(e.target.checked)

                        if (
                          e.target.checked &&
                          useVoteMin &&
                          votesMinState &&
                          (Number.isNaN(votesLimitState) || votesLimitState < votesMinState)
                        ) {
                          dispatch(change(stepFormName, 'votesLimit', votesMinState))
                          setVotesMinState(parseInt(votesMinState as unknown as string, 10))
                          setVotesLimitState(parseInt(votesMinState as unknown as string, 10))
                        } else if (e.target.checked) {
                          if (!votesLimitState || votesLimitState === 0) {
                            dispatch(change(stepFormName, 'votesLimit', 3))
                            setVotesLimitState(3)
                          }

                          if ((useVoteMin && !votesMinState) || votesMinState === 0 || votesMinState === 1) {
                            dispatch(change(stepFormName, 'votesMin', 1))
                            setVotesMinState(1)
                          }
                        }
                      }}
                    >
                      {intl.formatMessage({
                        id: 'activate-vote-ranking',
                      })}
                    </Field>
                    <Flex
                      as="span"
                      marginTop="8px"
                      fontWeight="400"
                      color="gray.700"
                      marginBottom={votesRankingState ? '0' : '24px'}
                      className="clear"
                    >
                      <FormattedHTMLMessage id="help-text-vote-ranking" />
                    </Flex>
                    {votesRankingState && (
                      <Flex as="span" marginBottom="24px">
                        <br />
                        <strong>
                          {intl.formatMessage(
                            {
                              id: 'help-vote-point',
                            },
                            {
                              points: votesLimitState,
                            },
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
                  helpText={intl.formatMessage({
                    id: 'secret-ballot-body',
                  })}
                  label={intl.formatMessage({
                    id: 'secret-ballot',
                  })}
                  onClick={() => {
                    const value = endAt || formValueSelector(stepFormName)(state, 'endAt') || null
                    dispatch(change(stepFormName, 'publishedVoteDate', value))
                  }}
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
                help={intl.formatMessage({
                  id: 'vote-help',
                })}
              />
              {!hasFeatureTwilio && <TeaserServices />}
            </AppBox>
          </Flex>
        </VoteFieldContainer>
      )}
    </>
  )
}
// @ts-ignore
export default connect<any, any>()(StepVotesFields)
