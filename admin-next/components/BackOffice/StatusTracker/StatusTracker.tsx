import { FC } from 'react'
import { Flex, Text, CapUIFontWeight, headingStyles } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'

interface StatusTrackerProps {
  values: {
    total: number
    pending: number
    accepted: number
  }
}

const StatusTracker: FC<StatusTrackerProps> = ({ values }) => {
  const intl = useIntl()

  return (
    <Flex
      direction="row"
      alignItems={'center'}
      justifyContent={'flex-end'}
      color="blue.800"
      spacing={4}
      {...headingStyles.h5}
      fontWeight={CapUIFontWeight.Semibold}
      mr={0}
      ml={'auto'}
      uppercase
      width={'100%'}
    >
      <Text fontWeight={700}>
        <Text as="span" color="blue.500" mr={1}>
          {values.total}
        </Text>
        {intl.formatMessage({ id: 'invitations-count' }, { num: values.total })}
      </Text>

      <Text fontWeight={700}>
        <Text as="span" color="orange.500" mr={1}>
          {values.pending}
        </Text>
        {intl.formatMessage({ id: 'waiting' })}
      </Text>

      <Text fontWeight={700}>
        <Text as="span" color="green.500" mr={1}>
          {values.accepted}
        </Text>
        {intl.formatMessage({ id: 'accepted-invitations' }, { num: values.accepted })}
      </Text>
    </Flex>
  )
}

export default StatusTracker
