import * as React from 'react'
import { graphql } from 'react-relay'
import type { ThemeListFieldQuery } from '@relay/ThemeListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { fetchQuery, GraphQLTaggedNode } from 'relay-runtime'
import { useIntl } from 'react-intl'

interface ThemeListFieldProps extends Omit<BaseField, 'onChange' | 'control'>, Omit<FieldSelect, 'onChange' | 'type'> {
  id?: string
  menuPortalTarget?: boolean
  disabled?: boolean
}

type ThemeListFieldValue = {
  label: string
  value: string
}

const getThemeList = graphql`
  query ThemeListFieldQuery($term: String) {
    themes(title: $term) {
      value: id
      label: title
    }
  }
` as GraphQLTaggedNode

export const ThemeListField: React.FC<ThemeListFieldProps> = ({ name, disabled, ...props }) => {
  const { control } = useFormContext()
  const intl = useIntl()

  const loadOptions = async (term: string): Promise<ThemeListFieldValue[]> => {
    const themesData = await fetchQuery<ThemeListFieldQuery>(environment, getThemeList, {
      term,
    }).toPromise()

    if (themesData && themesData.themes) {
      return themesData.themes.map(t => ({
        label: t.label,
        value: t.value,
      }))
    }

    return []
  }

  return (
    <FieldInput
      {...props}
      control={control}
      type="select"
      name={name}
      defaultOptions
      loadOptions={loadOptions}
      // @ts-expect-error: todo: fix error - update expected props?
      disabled={disabled}
      placeholder={intl.formatMessage({ id: 'select-themes' })}
    />
  )
}

export default ThemeListField
