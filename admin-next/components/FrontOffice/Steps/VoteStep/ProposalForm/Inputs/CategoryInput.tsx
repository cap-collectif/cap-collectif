import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Category = {
  id: string
  name: string
}

type Props = {
  control: Control<FormValues>
  categories: readonly Category[]
  categoryHelpText: string | null
}

const CategoryInput: React.FC<Props> = ({ control, categories, categoryHelpText }) => {
  const intl = useIntl()

  return (
    <FormControl name="category" control={control}>
      <FormLabel htmlFor="category" label={intl.formatMessage({ id: 'global.category' })} />
      <FieldInput
        type="select"
        control={control}
        name="category"
        id="category"
        placeholder={intl.formatMessage({ id: 'proposal.select.category' })}
        options={categories.map((cat: Category) => ({
          label: cat.name,
          value: cat.id,
        }))}
      />
      {categoryHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {categoryHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default CategoryInput
