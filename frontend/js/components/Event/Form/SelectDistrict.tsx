import React from 'react'
import { graphql, useFragment } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { Field } from 'redux-form'
import select from '../../Form/Select'
import type { SelectDistrict_query$key } from '~relay/SelectDistrict_query.graphql'
type Props = {
  readonly query: SelectDistrict_query$key
  readonly multi?: boolean
  readonly clearable?: boolean
  readonly name?: string
  readonly label?: string
  readonly optional?: boolean
  readonly placeholder?: string
  readonly disabled?: boolean
}
const FRAGMENT = graphql`
  fragment SelectDistrict_query on Query {
    globalDistricts {
      totalCount
      edges {
        node {
          id
          name
        }
      }
    }
  }
`

const renderLabel = (intl: IntlShape, label: string, optional: boolean) => {
  const message = intl.formatMessage({
    id: label,
  })
  return optional ? (
    <div>
      {message}
      <div className="excerpt inline">
        {intl.formatMessage({
          id: 'global.optional',
        })}
      </div>
    </div>
  ) : (
    message
  )
}

const SelectDistrict = ({
                         query,
                         multi = false,
                         clearable = false,
                         name = 'district',
                         label = 'global.district',
                         optional = false,
                         placeholder = 'global.select_districts',
                         disabled = false,
                       }: Props) => {
  const { globalDistricts } = useFragment(FRAGMENT, query)
  const intl = useIntl()
  const renderSelectedOption =
    globalDistricts && globalDistricts.edges
      ? globalDistricts.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => ({
          value: node.id,
          label: node.name,
        }))
      : []
  return (
    <div>
      <Field
        component={select}
        id="SelectDistrict-filter-district"
        name={name}
        placeholder={intl.formatMessage({
          id: placeholder,
        })}
        label={renderLabel(intl, label, optional)}
        options={renderSelectedOption}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        aria-controls="SelectDistrict-filter-district-listbox"
        multi={multi}
        clearable={clearable}
        disabled={disabled}
      />
    </div>
  )
}

export default SelectDistrict
