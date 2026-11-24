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
    <FormControl errorId="global.theme-error" name="theme" control={control} isRequired={themeMandatory}>
      <FormLabel id="label-global.theme" htmlFor="global.theme" label={label} />
      <FieldInput
        type="select"
        control={control}
        name="theme"
        id="global.theme"
        // The visible label targets the select container: name the focused react-select input explicitly
        aria-labelledby="label-global.theme"
        // react-select keeps aria-describedby for its placeholder while empty: link the error message this way
        aria-errormessage="global.theme-error"
        placeholder={intl.formatMessage({ id: 'proposal.select.theme' })}
        menuPortalTarget={null}
        options={themes.map((theme: Theme) => ({
          label: theme.title,
          value: theme.id,
        }))}
      />
      {themeHelpText && (
        <Text id="global.theme-help" color="text.tertiary" fontSize="sm" mt={1}>
          {themeHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default ThemeInput
