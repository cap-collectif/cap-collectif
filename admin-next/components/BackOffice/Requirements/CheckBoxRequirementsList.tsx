import React from 'react'
import { Box, Button, Flex } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Requirement } from '@components/BackOffice/Requirements/Requirements'
import CheckBoxRequirementItem from '@components/BackOffice/Requirements/CheckBoxRequirementItem'

const CheckBoxRequirementsList: React.FC = () => {
  const intl = useIntl()
  const { control } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requirements',
  })

  const checkBoxRequirements = fields as Array<Requirement>
  const hasCheckBox = checkBoxRequirements.some(checkBoxRequirement => checkBoxRequirement.typename === 'CHECKBOX')

  return (
    <Box mt={!hasCheckBox ? 0 : 4} fontWeight={600}>
      <Flex direction="column" spacing={4}>
        {checkBoxRequirements.map((checkBoxRequirement, index) => {
          return checkBoxRequirement.typename === 'CHECKBOX' ? (
            <CheckBoxRequirementItem
              key={checkBoxRequirement.id}
              id={checkBoxRequirement.id}
              index={index}
              remove={remove}
            />
          ) : null
        })}
      </Flex>
      <Button
        mt={4}
        variantSize="small"
        variant="secondary"
        variantColor="primary"
        onClick={() => {
          append({
            id: '',
            label: '',
            typename: 'CHECKBOX',
          })
        }}
      >
        {intl.formatMessage({ id: 'global.add' })}
      </Button>
    </Box>
  )
}

export default CheckBoxRequirementsList
