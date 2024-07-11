import React from 'react'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel } from '@cap-collectif/ui'
import { StepVisibilityTypeEnum } from '../CollectStep/CollectStepForm'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { graphql, useFragment } from 'react-relay'
import { ProposalSettings_step$key } from '../../../__generated__/ProposalSettings_step.graphql'

const STEP_FRAGMENT = graphql`
  fragment ProposalSettings_step on ProposalStep {
    statuses {
      id
      name
    }
  }
`

type Props = {
  step: ProposalSettings_step$key
}

const ProposalSettings: React.FC<Props> = ({ step: stepRef }) => {
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const intl = useIntl()
  const { control } = useFormContext()

  const sortOptions = [
    {
      label: intl.formatMessage({ id: 'global.random' }),
      value: 'RANDOM',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_comments',
      }),
      value: 'COMMENTS',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_last',
      }),
      value: 'LAST',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_old',
      }),
      value: 'OLD',
    },
    {
      label: intl.formatMessage({
        id: 'step.sort.votes',
      }),
      value: 'VOTES',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_least-votes',
      }),
      value: 'LEAST_VOTE',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_cheap',
      }),
      value: 'CHEAP',
    },
    {
      label: intl.formatMessage({
        id: 'global.filter_f_expensive',
      }),
      value: 'EXPENSIVE',
    },
  ]

  return (
    <>
      <FormControl name="allowAuthorsToAddNews" control={control} mb={6}>
        <FormLabel htmlFor="allowAuthorsToAddNews" label={intl.formatMessage({ id: 'proposal-news-label' })} />
        <FieldInput id="allowAuthorsToAddNews" name="allowAuthorsToAddNews" control={control} type="checkbox">
          {intl.formatMessage({ id: 'admin.allow.proposal.news' })}
        </FieldInput>
      </FormControl>
      <FormControl name="stepVisibilityType" control={control} mb={6}>
        <FormLabel htmlFor="stepVisibilityType" label={intl.formatMessage({ id: 'project-visibility' })} />
        <FieldInput
          id="stepVisibilityType"
          name="stepVisibilityType"
          control={control}
          type="radio"
          choices={[
            {
              id: StepVisibilityTypeEnum.PUBLIC,
              label: `${intl.formatMessage({
                id: 'public',
              })} - (${intl.formatMessage({ id: 'everybody' })})`,
              useIdAsValue: true,
            },
            {
              id: StepVisibilityTypeEnum.RESTRICTED,
              label: `${intl.formatMessage({
                id: 'global-restricted',
              })} - (${intl.formatMessage({
                id: 'authors-and-administrators',
              })})`,
              useIdAsValue: true,
            },
          ]}
        />
      </FormControl>
      <FormControl name="defaultSort" control={control} maxWidth="256px">
        <FormLabel
          htmlFor="defaultSort"
          label={intl.formatMessage({
            id: 'admin_next.fields.step.default_sort',
          })}
        />
        <FieldInput
          id="defaultSort"
          name="defaultSort"
          control={control}
          type="select"
          options={sortOptions}
          defaultOptions
        />
      </FormControl>
      <FormControl name="defaultStatus" control={control} maxWidth="256px">
        <FormLabel
          htmlFor="defaultStatus"
          label={intl.formatMessage({
            id: 'admin.fields.step.default_status',
          })}
        />
        <FieldInput
          id="defaultStatus"
          name="defaultStatus"
          control={control}
          type="select"
          options={step.statuses.map(status => ({
            label: status.name,
            value: status.id,
          }))}
          defaultOptions
        />
      </FormControl>
    </>
  )
}

export default ProposalSettings
