import React from 'react'
import { FormLabel } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'

type EnabledUnion = 'PUBLISHED' | 'DRAFT'
export const EnabledEnum: Record<EnabledUnion, EnabledUnion> = {
  PUBLISHED: 'PUBLISHED',
  DRAFT: 'DRAFT',
} as const

type Props = {
  fieldName?: 'isEnabled' | 'enabled'
}

const PublicationInput: React.FC<Props> = ({ fieldName = 'enabled' }) => {
  const intl = useIntl()
  const { control } = useFormContext()

  return (
    <FormControl name={fieldName} control={control} mt={4} mb={8}>
      <FormLabel label={intl.formatMessage({ id: 'global.publication' })} />
      <FieldInput
        type="radio"
        name={fieldName}
        id={fieldName}
        control={control}
        choices={[
          {
            id: EnabledEnum.PUBLISHED,
            useIdAsValue: true,
            label: intl.formatMessage({
              id: 'admin.fields.step.is_enabled',
            }),
          },
          {
            id: EnabledEnum.DRAFT,
            useIdAsValue: true,
            label: intl.formatMessage({
              id: 'admin.fields.proposal.state.choices.draft',
            }),
          },
        ]}
      />
    </FormControl>
  )
}

export default PublicationInput
