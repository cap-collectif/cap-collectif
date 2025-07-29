import * as React from 'react'
import { graphql } from 'react-relay'
import type { DistrictListFieldQuery, DistrictListFieldQuery$data } from '@relay/DistrictListFieldQuery.graphql'
import { environment } from 'utils/relay-environement'
import { FieldInput, FieldSelect, BaseField } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import { GraphQLTaggedNode, fetchQuery } from 'relay-runtime'
import { useIntl } from 'react-intl'

interface DistrictListFieldProps
  extends Omit<BaseField, 'onChange' | 'control'>,
    Omit<FieldSelect, 'type' | 'onChange'> {
  id?: string
  menuPortalTarget?: boolean
}

type DistrictListFieldValue = {
  label: string
  value: string
}

const getDistrictList = graphql`
  query DistrictListFieldQuery($term: String) {
    globalDistricts(name: $term) {
      edges {
        node {
          value: id
          label: name
        }
      }
    }
  }
` as GraphQLTaggedNode

const formatDistrictsData = (globalDistricts: DistrictListFieldQuery$data['globalDistricts']) => {
  if (!globalDistricts) return []
  return (
    globalDistricts.edges?.map(edge => edge?.node)?.map(d => ({ value: d?.value ?? '', label: d?.label ?? '' })) || []
  )
}

export const DistrictListField: React.FC<DistrictListFieldProps> = ({ name, ...props }) => {
  const { control } = useFormContext()
  const intl = useIntl()

  const loadOptions = async (term: string): Promise<DistrictListFieldValue[]> => {
    const districtsData = await fetchQuery<DistrictListFieldQuery>(environment, getDistrictList, {
      term,
    }).toPromise()

    if (districtsData && districtsData.globalDistricts) {
      return formatDistrictsData(districtsData.globalDistricts) as DistrictListFieldValue[]
    }

    return []
  }

  return (
    <FieldInput
      {...props}
      type="select"
      control={control}
      name={name}
      defaultOptions
      loadOptions={loadOptions}
      placeholder={intl.formatMessage({ id: 'select-one-or-more-zones' })}
    />
  )
}

export default DistrictListField
