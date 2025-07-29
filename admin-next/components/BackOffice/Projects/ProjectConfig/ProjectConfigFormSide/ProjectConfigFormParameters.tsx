import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Accordion, CapUIIcon, FormLabel, Icon, Tooltip } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { graphql, useFragment } from 'react-relay'

import { useIntl } from 'react-intl'
import ThemeListField from 'components/BackOffice/Form/ThemeListField'
import DistrictListField from 'components/BackOffice/Form/DistrictListField'
import { ProjectConfigFormParameters_project$key } from '@relay/ProjectConfigFormParameters_project.graphql'

export interface ProjectConfigFormParametersProps {
  project: ProjectConfigFormParameters_project$key
}

const PROJECT_FRAGMENT = graphql`
  fragment ProjectConfigFormParameters_project on Project {
    canEnableProposalStepSplitView
    steps(excludePresentationStep: true) {
      __typename
    }
  }
`

const ProjectConfigFormParameters: React.FC<ProjectConfigFormParametersProps> = ({ project: projectRef }) => {
  const intl = useIntl()
  const hasFeatureNewVoteStep = useFeatureFlag('new_vote_step')
  const { canEnableProposalStepSplitView, steps } = useFragment(PROJECT_FRAGMENT, projectRef)

  const hasProposalStep = steps.some(step => step.__typename === 'CollectStep' || step.__typename === 'SelectionStep')

  const { control, setValue } = useFormContext()

  return (
    <>
      <Accordion.Button>{intl.formatMessage({ id: 'admin-menu-parameters' })}</Accordion.Button>
      <Accordion.Panel>
        {hasFeatureNewVoteStep && hasProposalStep ? (
          <FormControl
            name="isProposalStepSplitViewEnabled"
            control={control}
            width="auto"
            direction="row"
            align="flex-start"
          >
            <FormLabel label={intl.formatMessage({ id: 'admin.fields.project.split-view' })} />
            <FieldInput
              id="isProposalStepSplitViewEnabled"
              name="isProposalStepSplitViewEnabled"
              control={control}
              type="switch"
              disabled={!canEnableProposalStepSplitView}
            />
          </FormControl>
        ) : null}
        <FormControl name="video" control={control}>
          <FormLabel htmlFor="video" label={intl.formatMessage({ id: 'admin.fields.project.video' })}>
            <Tooltip
              label={intl.formatMessage({
                id: 'admin.project.video',
              })}
            >
              <Icon name={CapUIIcon.Info} color="blue.500" />
            </Tooltip>
          </FormLabel>
          <FieldInput
            id="video"
            name="video"
            control={control}
            type="textarea"
            rows={2}
            placeholder={intl.formatMessage({
              id: 'admin-project-video-placeholder',
            })}
          />
        </FormControl>
        <FormControl name="themes" control={control}>
          <FormLabel label={intl.formatMessage({ id: 'global.themes' })} />
          <ThemeListField name="themes" isMulti id="themes" menuPortalTarget={undefined} />
        </FormControl>
        <FormControl name="districts" control={control}>
          <FormLabel label={intl.formatMessage({ id: 'proposal_form.districts' })} />
          <DistrictListField name="districts" isMulti id="districts" menuPortalTarget={undefined} />
        </FormControl>
        <FormControl name="addressText" control={control}>
          <FormLabel label={intl.formatMessage({ id: 'proposal_form.address' })} />
          <FieldInput
            name="addressText"
            type="address"
            placeholder={intl.formatMessage({ id: 'vote.step.search' })}
            control={control}
            getAddress={add => {
              setValue('address', add)
            }}
            onChange={e => {
              if (e === '') setValue('address', null)
            }}
          />
        </FormControl>

        <FormControl name="metaDescription" control={control}>
          <FormLabel htmlFor="metaDescription" label={intl.formatMessage({ id: 'global.meta.description' })}>
            <Tooltip
              label={intl.formatMessage({
                id: 'admin.help.metadescription',
              })}
            >
              <Icon name={CapUIIcon.Info} color="blue.500" />
            </Tooltip>
          </FormLabel>
          <FieldInput
            name="metaDescription"
            type="textarea"
            control={control}
            placeholder={intl.formatMessage({
              id: 'admin.fields.menu_item.parent_empty',
            })}
            maxLength={160}
          />
        </FormControl>

        <FormControl name="customCode" control={control}>
          <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })} />
          <FieldInput name="customCode" type="textarea" control={control} placeholder="<style></style>" />
        </FormControl>
        <FormControl name="opinionCanBeFollowed" control={control}>
          <FieldInput id="opinionCanBeFollowed" name="opinionCanBeFollowed" type="checkbox" control={control}>
            <FormLabel
              htmlFor="opinionCanBeFollowed"
              label={intl.formatMessage({ id: 'activate-proposals-subscription' })}
            >
              <Tooltip
                label={intl.formatMessage({
                  id: 'activity-tracking-help-text',
                })}
              >
                <Icon name={CapUIIcon.Info} color="blue.500" />
              </Tooltip>
            </FormLabel>
          </FieldInput>
        </FormControl>
      </Accordion.Panel>
    </>
  )
}

export default ProjectConfigFormParameters
