import React from 'react'
import RequirementItem from '@components/BackOffice/Requirements/RequirementItem'
import { useFormContext } from 'react-hook-form'
import { Requirement, RequirementTypeName } from '@components/BackOffice/Requirements/Requirements'
import { Flex } from '@cap-collectif/ui'
import PhoneVerifiedRequirementItem from '@components/BackOffice/Requirements/PhoneVerifiedRequirementItem'

type Props = {
  id: string
  index: number
  typename: RequirementTypeName
  disabled: boolean
  isSmsVoteEnabled: boolean
}

const PhoneRequirementItem: React.FC<Props> = ({ index, id, typename, disabled, isSmsVoteEnabled }) => {
  const { watch, setValue } = useFormContext()
  const requirements = watch('requirements') as Array<Requirement>
  const phoneVerifiedIndex = requirements.findIndex(requirement => requirement?.typename === 'PHONE_VERIFIED')
  const onChange = ({ isChecked }: { isChecked: boolean }) => {
    if (!isChecked) {
      setValue(`requirements.${phoneVerifiedIndex}`, {})
    }
  }

  const phone = watch(`requirements.${index}`)
  const showPhoneVerified = phone && isSmsVoteEnabled ? phone.isChecked : false

  return (
    <Flex direction="column">
      <RequirementItem index={index} id={id} key={typename} typename={typename} disabled={disabled} onChange={onChange}>
        {showPhoneVerified && <PhoneVerifiedRequirementItem />}
      </RequirementItem>
    </Flex>
  )
}

export default PhoneRequirementItem
