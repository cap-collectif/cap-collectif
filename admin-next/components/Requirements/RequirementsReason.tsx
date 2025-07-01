import React from 'react'
import { FormLabel } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

const RequirementsReason: React.FC = () => {
  const intl = useIntl()
  const { control } = useFormContext()
  return (
    <FormControl mb={6} name="requirementsReason" control={control} variantColor="hierarchy">
      <FormLabel htmlFor="requirementsReason" label={intl.formatMessage({ id: 'reason-for-collection' })} />
      <FieldInput
        id="requirementsReason"
        name="requirementsReason"
        control={control}
        type="textarea"
        placeholder={intl.formatMessage({ id: 'explain-why-you-need-those-informations' })}
      />
    </FormControl>
  )
}

export default RequirementsReason
