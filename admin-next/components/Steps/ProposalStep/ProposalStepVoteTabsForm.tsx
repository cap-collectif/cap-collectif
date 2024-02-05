import * as React from 'react'
import {
  CapUIIcon,
  CapUIIconSize,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  FormLabel,
  headingStyles,
  Icon,
  SpotIcon,
  Switch,
  Tabs,
  Text,
  Tooltip,
} from '@cap-collectif/ui'

import { ListCard } from '@ui/ListCard'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormProvider, UseFormReturn } from 'react-hook-form'
import TextEditor from '@components/Form/TextEditor/TextEditor'
import { useIntl } from 'react-intl'
import { useFeatureFlags } from '@hooks/useFeatureFlag'

type ProposalStepVoteType = "BUDGET" | "DISABLED" | "SIMPLE"
export interface ProposalStepVoteTabsFormProps {
  formMethods: UseFormReturn<any>
  defaultLocale: string
}

const ProposalStepVoteTabsForm: React.FC<ProposalStepVoteTabsFormProps> = ({
                                                                           formMethods,
                                                                           defaultLocale,
                                                                         }) => {
  const intl = useIntl()
  const { watch, setValue, control } = formMethods
  const { votes_min } = useFeatureFlags(['votes_min'])

  const voteType = watch('voteType');
  const budget = watch('budget');
  const voteThreshold = watch('voteThreshold');
  const secretBallot = watch('secretBallot');
  const votesMin = watch('votesMin');
  const votesLimit = watch('votesLimit');

  return (
    <Tabs
      selectedId={voteType}
      onChange={selected => {
        if ((selected as ProposalStepVoteType) !== voteType) {
          setValue('voteType', selected as ProposalStepVoteType)
        }
      }}
    >
      <Tabs.ButtonList ariaLabel={intl.formatMessage({ id: 'vote-capitalize' })}>
        <Tabs.Button id={'SIMPLE' as ProposalStepVoteType} labelSx={{paddingX:0, marginLeft:'auto',marginRight:'auto'}}>
          {intl.formatMessage({ id: 'step.vote_type.simple' })}
        </Tabs.Button>
        <Tabs.Button id={'BUDGET' as ProposalStepVoteType} labelSx={{paddingX:0, marginLeft:'auto',marginRight:'auto'}}>
          {intl.formatMessage({ id: 'global.advanced.text' })}
        </Tabs.Button>
        <Tabs.Button id={'DISABLED' as ProposalStepVoteType} labelSx={{paddingX:0, marginLeft:'auto',marginRight:'auto'}}>
          {intl.formatMessage({ id: 'action_disable' })}
        </Tabs.Button>
      </Tabs.ButtonList>
      <Tabs.PanelList>
        <Tabs.Panel>
          {intl.formatMessage({
            id: 'admin.select.step.simple.vote.prompt',
          })}
        </Tabs.Panel>
        <Tabs.Panel>
          <Flex direction="column" gap={4}>
            {intl.formatMessage({
              id: 'admin.select.step.advanced.vote.prompt',
            })}

            <ListCard.Item backgroundColor="white" mb={4} border="none" align="flex-start">
              <Flex direction="column" width="100%">
                <Flex direction="row" justify="space-between" width="100%" alignItems="center">
                  <ListCard.Item.Label>
                    {intl.formatMessage({
                      id: 'maximum-budget',
                    })}
                  </ListCard.Item.Label>
                  <Switch
                    id="budget"
                    checked={budget !== null && budget !== undefined}
                    name="budget"
                    onChange={event => {
                      const toggle = budget !== null && budget !== undefined
                      if (toggle) {
                        setValue('budget', null)
                      } else {
                        setValue('budget', 0)
                      }
                    }}
                  />
                </Flex>
                {budget !== null && budget !== undefined && (
                  <Flex direction="column" gap={2}>
                    <Text color="gray.700">
                      {intl.formatMessage({
                        id: 'budget-help',
                      })}
                    </Text>
                    <FormControl name="budget" width="auto" control={control} mb={6}>
                      <FieldInput id="budget" name="budget" control={control} type="number" />
                    </FormControl>
                  </Flex>
                )}
              </Flex>
            </ListCard.Item>
            <ListCard.Item backgroundColor="white" mb={4} border="none" align="flex-start">
              <Flex direction="column" width="100%">
                <Flex direction="row" justify="space-between" width="100%">
                  <ListCard.Item.Label>
                    {intl.formatMessage({
                      id: 'admin.fields.step.vote_threshold.input',
                    })}
                  </ListCard.Item.Label>
                  <Switch
                    id="votesMin"
                    checked={(voteThreshold ?? 0) > 0}
                    name="voteThreshold"
                    onChange={event => {
                      if ((voteThreshold ?? 0) > 0) {
                        setValue('voteThreshold', null)
                      } else {
                        setValue('voteThreshold', 1)
                      }
                    }}
                  />
                </Flex>
                {(voteThreshold ?? 0) > 0 && (
                  <Flex direction="column" gap={2}>
                    <Text color="gray.700">
                      {intl.formatMessage({
                        id: 'ceil-help',
                      })}
                    </Text>
                    <FormControl name="voteThreshold" width="auto" control={control} mb={6}>
                      <FieldInput id="voteThreshold" name="voteThreshold" control={control} min={0} type="number" />
                    </FormControl>
                    <Text
                      color="gray.700"
                      display="flex"
                      flexDirection="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      gap={2}
                    >
                      {intl.formatMessage({
                        id: 'automatic-archiving',
                      })}
                      <Tooltip label={intl.formatMessage({ id: 'archive-proposals-help-text' })}>
                        <Icon name={CapUIIcon.Info} size={CapUIIconSize.Sm} color="blue.500" />
                      </Tooltip>
                    </Text>
                    <Flex direction="row" gap={2}>
                      <FormControl name="proposalArchivedTime" width="auto" control={control}>
                        <FieldInput
                          id="proposalArchivedTime"
                          name="proposalArchivedTime"
                          control={control}
                          type="number"
                        />
                      </FormControl>
                      <FormControl name="proposalArchivedUnitTime" width="auto" control={control}>
                        <FieldInput
                          name="proposalArchivedUnitTime"
                          control={control}
                          type="select"
                          options={[
                            { label: intl.formatMessage({ id: 'global.days' }), value: 'DAYS' },
                            { label: intl.formatMessage({ id: 'global.months' }), value: 'MONTHS' },
                          ]}
                          defaultOptions
                        />
                      </FormControl>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </ListCard.Item>
            <ListCard.Item backgroundColor="white" mb={4} border="none" align="flex-start">
              <Flex direction="column" width="100%">
                <Flex direction="row" justify="space-between" width="100%">
                  <ListCard.Item.Label>
                    {intl.formatMessage({
                      id: 'Number-of-votes-per-person',
                    })}
                  </ListCard.Item.Label>
                  <Switch
                    id="votesMin-votesLimit"
                    checked={votesMin !== null && votesLimit !== null}
                    name="voteThreshold"
                    onChange={event => {
                      const toggle = votesMin !== null && votesLimit !== null
                      if (toggle) {
                        setValue('votesMin', null)
                        setValue('votesLimit', null)
                      } else {
                        setValue('votesMin', 0)
                        setValue('votesLimit', 0)
                      }
                    }}
                  />
                </Flex>
                {votesMin !== null && votesLimit !== null && (
                  <Flex direction="column" gap={2}>
                    <Text color="gray.700">
                      {intl.formatMessage({
                        id: 'vote-classement-help',
                      })}
                    </Text>
                    <Flex direction="row" gap={2}>
                      {votes_min && (
                        <FormControl name="votesMin" width="auto" control={control} mb={6}>
                          <FormLabel
                            htmlFor="votesMin"
                            label={intl.formatMessage({
                              id: 'global-minimum-full',
                            })}
                          />
                          <FieldInput id="votesMin" name="votesMin" control={control} type="number" />
                        </FormControl>
                      )}
                      <FormControl name="votesLimit" width="auto" control={control} mb={6}>
                        <FormLabel
                          htmlFor="votesLimit"
                          label={intl.formatMessage({
                            id: 'maximum-vote',
                          })}
                        />
                        <FieldInput id="votesLimit" name="votesLimit" control={control} type="number" />
                      </FormControl>
                    </Flex>
                    <FormControl name="votesRanking" control={control}>
                      <FieldInput id="votesRanking" name="votesRanking" control={control} type="checkbox">
                        {intl.formatMessage({
                          id: 'activate-vote-ranking',
                        })}
                      </FieldInput>
                    </FormControl>
                  </Flex>
                )}
              </Flex>
            </ListCard.Item>
            <ListCard.Item backgroundColor="white" mb={4} border="none" align="flex-start">
              <Flex direction="column" width="100%">
                <Flex direction="row" justify="space-between" width="100%">
                  <ListCard.Item.Label>
                    {intl.formatMessage({
                      id: 'secret-ballot',
                    })}
                  </ListCard.Item.Label>
                  <Switch
                    id="secretBallot"
                    checked={secretBallot}
                    name="secretBallot"
                    onChange={event => {
                      if (secretBallot) {
                        setValue('secretBallot', false)
                        setValue('publishedVoteDate', null)
                      } else {
                        setValue('secretBallot', true)
                      }
                    }}
                  />
                </Flex>
                {secretBallot && (
                  <Flex direction="column" gap={2}>
                    <Text color="gray.700">
                      {intl.formatMessage({
                        id: 'secret-ballot-body',
                      })}
                    </Text>
                    <Flex direction="row" gap={2}>
                      <FormControl name="publishedVoteDate" width="auto" control={control} mb={6}>
                        <FormLabel
                          htmlFor="publishedVoteDate"
                          label={intl.formatMessage({
                            id: 'published-vote-date',
                          })}
                        >
                          <Text fontSize={2} color="gray.500">
                            {intl.formatMessage({
                              id: 'global.optional',
                            })}
                          </Text>
                        </FormLabel>
                        <FieldInput id="publishedVoteDate" name="publishedVoteDate" control={control} type="dateHour" dateInputProps={{ isOutsideRange: true }}  />
                      </FormControl>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </ListCard.Item>
            <FormProvider {...formMethods}>
              <TextEditor
                name="votesHelpText"
                label={intl.formatMessage({
                  id: 'admin.fields.step.votesHelpText',
                })}
                platformLanguage={defaultLocale}
                selectedLanguage={defaultLocale}
                placeholder={intl.formatMessage({ id: 'vote-help' })}
              />
            </FormProvider>
            <Flex direction="column" bg="blue.100" border="normal" borderColor="blue.200" p={4} borderRadius="normal">
              <Text color="aqua.900" fontWeight="semibold" fontSize={1} lineHeight="sm">
                {intl.formatMessage({ id: 'you-want-to-secure-vote-step' })}
              </Text>
              <Text color="aqua.900" fontSize={1} lineHeight="sm" mb={2}>
                {intl.formatMessage({ id: 'enjoy-following-services' })}
              </Text>

              <Flex direction="row" gap={1}>
                <Flex direction="row" spacing={1} align="center" width="50%">
                  <SpotIcon name={CapUISpotIcon.SMS} size={CapUISpotIconSize.Sm} />
                  <Flex direction="column" spacing={1}>
                    <Text color="gray.900" fontSize={1} fontWeight="semibold" lineHeight="sm">
                      {intl.formatMessage({ id: 'verification-with-sms' })}
                    </Text>
                    <Text color="gray.900" fontSize={1} lineHeight="sm">
                      {intl.formatMessage({
                        id: 'send-verification-code-sms',
                      })}
                    </Text>
                  </Flex>
                </Flex>

                <Flex direction="row" spacing={1} align="center" width="50%" mb={4}>
                  <SpotIcon name={CapUISpotIcon.EMAIL_SEND} size={CapUISpotIconSize.Sm} />
                  <Flex direction="column" spacing={1}>
                    <Text color="gray.900" fontSize={1} fontWeight="semibold" lineHeight="sm">
                      {intl.formatMessage({ id: 'identification_code' })}
                    </Text>
                    <Text color="gray.900" fontSize={1} lineHeight="sm">
                      {intl.formatMessage({
                        id: 'send-nominative-identification-code',
                      })}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              <Text
                as="a"
                href="/admin-next/securedParticipation"
                target="_blank"
                color="blue.500"
                {...headingStyles.h5}
              >
                {intl.formatMessage({ id: 'learn.more' })}
              </Text>
            </Flex>
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel />
      </Tabs.PanelList>
    </Tabs>
  )
}

export default ProposalStepVoteTabsForm
