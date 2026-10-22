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
    <FormControl errorId="global.category-error" name="category" control={control}>
      <FormLabel
        id="label-global.category"
        htmlFor="global.category"
        label={intl.formatMessage({ id: 'global.category' })}
      />
      <FieldInput
        type="select"
        control={control}
        name="category"
        id="global.category"
        placeholder={intl.formatMessage({ id: 'proposal.select.category' })}
        menuPortalTarget={null}
        options={categories.map((cat: Category) => ({
          label: cat.name,
          value: cat.id,
        }))}
      />
      {categoryHelpText && (
        <Text id="global.category-help" color="text.tertiary" fontSize="sm" mt={1}>
          {categoryHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default CategoryInput
