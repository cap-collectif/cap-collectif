import React, { ChangeEvent } from 'react'
import { CapUIFontSize, CapUIIcon, Flex, Icon, Switch, Text, Tooltip } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { config, RequirementTypeName } from '../Requirements/Requirements'
import { useFormContext } from 'react-hook-form'

type Props = {
  id: string
  index: number
  typename: RequirementTypeName
  disabled: boolean
  onChange?: ({ isChecked }: { isChecked: boolean }) => void
  children?: React.ReactNode
}

const RequirementItem: React.FC<Props> = ({
  id = '',
  index,
  typename,
  disabled = false,
  onChange: onChangeCallback,
  children,
}) => {
  const requirementKey = `requirements.${index}`
  const { setValue, watch } = useFormContext()
  const requirement = watch(requirementKey)
  const isChecked = requirement.isChecked ?? false

  const intl = useIntl()
  const [checked, setIsChecked] = React.useState(() => isChecked)

  const apiTypename = config[typename].apiTypename
  const title = intl.formatMessage({ id: config[typename].title })
  const tooltip = config[typename].tooltip ? intl.formatMessage({ id: config[typename].tooltip }) : null

  const fc = watch('requirements').find(r => r.typename === 'FRANCE_CONNECT')
  const isDataCollectedByFranceConnect = requirement?.isCollectedByFranceConnect && fc?.isChecked

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIsChecked(isChecked)
    const value = {
      id,
      label: '',
      typename: apiTypename,
      isCollectedByFranceConnect: requirement.isCollectedByFranceConnect,
      isChecked: isChecked,
    }
    setValue(requirementKey, value)
    if (onChangeCallback) {
      onChangeCallback({ isChecked })
    }
  }

  return (
    <Flex bg="white" direction="column" p={4} borderRadius="4px">
      <Flex justifyContent="space-between">
        <Text as="label" htmlFor={typename} fontWeight={600} width="100%" color="blue.900">
          <Flex justifyContent="space-between">
            {tooltip ? (
              <Flex>
                <Text>{title}</Text>
                <Tooltip label={tooltip}>
                  <Icon name={CapUIIcon.Info} color={'blue.500'} />
                </Tooltip>
              </Flex>
            ) : (
              title
            )}
            {isDataCollectedByFranceConnect && (
              <Text as="span" mr={4} fontSize={CapUIFontSize.Caption} color="gray.400">
                {intl.formatMessage({ id: 'data-collected-by-france-connect' })}
              </Text>
            )}
          </Flex>
        </Text>
        <Switch
          id={typename}
          checked={checked || isDataCollectedByFranceConnect}
          onChange={onChange}
          disabled={disabled || isDataCollectedByFranceConnect}
        />
      </Flex>
      {children}
    </Flex>
  )
}

export default RequirementItem
