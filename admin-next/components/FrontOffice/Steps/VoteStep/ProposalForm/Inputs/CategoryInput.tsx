import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'
import OptionalMention from '../OptionalMention'

type Category = {
  id: string
  name: string
}

type Props = {
  control: Control<FormValues>
  categories: readonly Category[]
  categoryHelpText: string | null
  categoryMandatory: boolean
}

const CategoryInput: React.FC<Props> = ({ control, categories, categoryHelpText, categoryMandatory }) => {
  const intl = useIntl()

  return (
    <FormControl errorId="global.category-error" name="category" control={control} isRequired={categoryMandatory}>
      <FormLabel
        id="label-global.category"
        htmlFor="global.category"
        label={intl.formatMessage({ id: 'global.category' })}
      >
        {categoryMandatory ? null : <OptionalMention />}
      </FormLabel>
      <FieldInput
        type="select"
        control={control}
        name="category"
        id="global.category"
        // The visible label targets the select container: name the focused react-select input explicitly
        aria-labelledby="label-global.category"
        // react-select keeps aria-describedby for its placeholder while empty: link the error message this way
        aria-errormessage="global.category-error"
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
