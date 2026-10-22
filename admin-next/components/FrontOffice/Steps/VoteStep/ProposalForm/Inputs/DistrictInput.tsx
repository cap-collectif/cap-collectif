import { FieldInput, FormControl } from '@cap-collectif/form'
import { FormLabel, Text } from '@cap-collectif/ui'
import * as React from 'react'
import { Control } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { FormValues } from '../ProposalFormModal.type'

type District = {
  id: string
  name: string
}

type Props = {
  control: Control<FormValues>
  districts: readonly District[]
  districtHelpText: string | null
  districtMandatory: boolean
}

const DistrictInput: React.FC<Props> = ({ control, districts, districtHelpText, districtMandatory }) => {
  const intl = useIntl()

  return (
    <FormControl errorId="proposal_district-error" name="district" control={control} isRequired={districtMandatory}>
      <FormLabel
        id="label-proposal_district"
        htmlFor="proposal_district"
        label={intl.formatMessage({ id: 'proposal.district' })}
      />
      <FieldInput
        type="select"
        control={control}
        name="district"
        id="proposal_district"
        placeholder={intl.formatMessage({ id: 'proposal.select.district' })}
        menuPortalTarget={null}
        options={districts.map((district: District) => ({
          label: district.name,
          value: district.id,
        }))}
      />
      {districtHelpText && (
        <Text id="proposal_district-help" color="text.tertiary" fontSize="sm" mt={1}>
          {districtHelpText}
        </Text>
      )}
    </FormControl>
  )
}

export default DistrictInput
