import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Accordion, CapUIIcon, FormLabel, Icon, Tooltip } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'

import { useIntl } from 'react-intl'
import ThemeListField from 'components/Form/ThemeListField'
import DistrictListField from 'components/Form/DistrictListField'

const ProjectConfigFormParameters: React.FC = () => {
  const intl = useIntl()

  const { control, setValue } = useFormContext()

  return (
    <>
      <Accordion.Button>{intl.formatMessage({ id: 'admin-menu-parameters' })}</Accordion.Button>
      <Accordion.Panel>
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
          />
        </FormControl>
        <FormControl name="customCode" control={control}>
          <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })} />
          <FieldInput name="customCode" type="textarea" control={control} placeholder="<style></style>" />
        </FormControl>
        <FormControl name="opinionCanBeFollowed" control={control}>
          <FieldInput id="opinionCanBeFollowed" name="opinionCanBeFollowed" type="checkbox" control={control}>
            {intl.formatMessage({ id: 'activate-proposals-subscription' })}
          </FieldInput>
        </FormControl>
      </Accordion.Panel>
    </>
  )
}

export default ProjectConfigFormParameters
