import React from 'react'
import { Flex, Text } from '@cap-collectif/ui'
import RequirementItem from '@components/BackOffice/Requirements/RequirementItem'
import { useIntl } from 'react-intl'
import { ToggleRequirement } from '@components/BackOffice/Requirements/Requirements'
import PhoneRequirementItem from '@components/BackOffice/Requirements/PhoneRequirementItem'

type Props = {
  toggleRequirements: Array<ToggleRequirement>
}

const ToggleRequirementsList: React.FC<Props> = ({ toggleRequirements }) => {
  const intl = useIntl()

  const isSmsVoteEnabled = toggleRequirements.some(requirement => requirement.typename === 'PhoneVerifiedRequirement')

  return (
    <>
      <Text mb={4}>{intl.formatMessage({ id: 'required-infos' })}</Text>
      <Flex direction="column" spacing={4}>
        {toggleRequirements.map((requirement, index) => {
          if (requirement.typename === 'PhoneRequirement') {
            return (
              <PhoneRequirementItem
                index={index}
                id={requirement.id}
                key={requirement.typename}
                typename={requirement.typename}
                disabled={requirement.disabled}
                isSmsVoteEnabled={isSmsVoteEnabled}
              />
            )
          }

          if (requirement.typename === 'PhoneVerifiedRequirement') return null

          return (
            <RequirementItem
              index={index}
              id={requirement.id}
              key={requirement.typename}
              typename={requirement.typename}
              disabled={requirement.disabled}
            />
          )
        })}
      </Flex>
    </>
  )
}

export default ToggleRequirementsList
