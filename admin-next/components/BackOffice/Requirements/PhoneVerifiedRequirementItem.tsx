import React, { ChangeEvent } from 'react'
import { Checkbox, Flex, Text } from '@cap-collectif/ui'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'

const PhoneVerifiedRequirementItem: React.FC = () => {
  const intl = useIntl()
  const { watch, setValue } = useFormContext()
  const requirements = watch('requirements')
  const phoneVerifiedIndex = requirements.findIndex(requirement => requirement.typename === 'PHONE_VERIFIED')
  const key = `requirements.${phoneVerifiedIndex}`
  const requirement = watch(key)
  const isChecked = requirement?.isChecked ?? false

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    const value = { id: requirement?.id ?? '', label: '', typename: 'PHONE_VERIFIED', isChecked }
    setValue(key, value)
  }

  return (
    <Flex mt={1}>
      <Checkbox id="phone_verified" checked={isChecked} onChange={onChange} />
      <Text as="label" htmlFor="phone_verified" color="gray.700" ml={1}>
        {intl.formatMessage({ id: 'activate-sms-verification' })}
      </Text>
    </Flex>
  )
}

export default PhoneVerifiedRequirementItem
