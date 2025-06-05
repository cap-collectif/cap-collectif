import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { Accordion } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useIntl } from 'react-intl'
import GroupListField from 'components/Form/GroupListField'

const ProjectConfigFormAccess: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const intl = useIntl()

  const { watch, control } = useFormContext()

  const visibility = watch('visibility')

  const choices = [
    {
      id: 'ME',
      useIdAsValue: true,
      label: intl.formatMessage({
        id: 'myself-visibility-only-me',
      }),
    },
    {
      id: 'PUBLIC',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'public-everybody' }),
    },
    {
      id: 'CUSTOM',
      useIdAsValue: true,
      label: intl.formatMessage({ id: 'global.custom.feminine' }),
    },
  ]

  if (isAdmin)
    choices
      .splice(1, 0, {
        id: 'ADMIN',
        useIdAsValue: true,
        label: intl.formatMessage({ id: 'global-administrators' }),
      })
      .join()

  return (
    <>
      <Accordion.Button>{intl.formatMessage({ id: 'project-access' })}</Accordion.Button>
      <Accordion.Panel>
        <FormControl name="visibility" control={control} isRequired>
          <FieldInput type="radio" name="visibility" id="visibility" control={control} choices={choices} />
        </FormControl>
        {visibility?.labels?.[0] === 'CUSTOM' ? (
          <GroupListField name="restrictedViewerGroups" id="restrictedViewerGroups" control={control} isMulti />
        ) : null}
      </Accordion.Panel>
    </>
  )
}

export default ProjectConfigFormAccess
