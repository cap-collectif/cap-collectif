import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type Theme = {
  id: string
  title: string
}

type Props = {
  control: Control<FormValues>
  themes: readonly Theme[]
  themeHelpText: string | null
  themeMandatory: boolean
}

const ThemeInput: React.FC<Props> = ({ control, themes, themeHelpText, themeMandatory }) => {
  const intl = useIntl()

  const label = themeMandatory
    ? intl.formatMessage({ id: 'global.theme' })
    : `${intl.formatMessage({ id: 'global.theme' })} (${intl.formatMessage({ id: 'global.optional' })})`

  return (
    <FormControl name="theme" control={control}>
      <FormLabel htmlFor="theme" label={label} />
      <FieldInput
        type="select"
        control={control}
        name="theme"
        id="theme"
        placeholder={intl.formatMessage({ id: 'proposal.select.theme' })}
        options={themes.map((theme: Theme) => ({
          label: theme.title,
          value: theme.id,
        }))}
      />
      {themeHelpText && (
        <Text color="text.tertiary" fontSize="sm" mt={1}>
          {themeHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default ThemeInput
