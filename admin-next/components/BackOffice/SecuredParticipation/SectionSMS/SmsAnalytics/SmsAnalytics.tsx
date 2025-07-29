import type { FC } from 'react'
import { graphql, useFragment } from 'react-relay'
import { CountSection } from '@ui/CountSection'
import { CapUIIcon, CapUIIconSize, Flex, Icon, Tooltip } from '@cap-collectif/ui'
import { IntlShape, useIntl } from 'react-intl'
import type { RemainingSmsCreditStatus, SmsAnalytics_smsAnalytics$key } from '@relay/SmsAnalytics_smsAnalytics.graphql'
import type { VariantType } from '@ui/CountSection/CountSection'
import { useAppContext } from '../../../AppProvider/App.context'

const FRAGMENT = graphql`
  fragment SmsAnalytics_smsAnalytics on SmsAnalytics {
    totalCredits
    consumedCredits
    remainingCredits {
      amount
      status
    }
  }
`

type SmsAnalyticsProps = {
  smsAnalytics: SmsAnalytics_smsAnalytics$key
}

type StatusCount = Omit<
  {
    [key in RemainingSmsCreditStatus]: VariantType
  },
  '%future added value'
>

const STATUS_COUNT: StatusCount = {
  VERY_LOW: 'red',
  LOW: 'yellow',
  IDLE: 'blue',
  TOTAL: 'blue',
}

const getAlertMessage = (
  isSuperAdmin: boolean,
  status: RemainingSmsCreditStatus,
  intl: IntlShape,
  creditCount: number,
): string => {
  if (status === 'VERY_LOW') {
    if (isSuperAdmin) return 'advice-recharge-credit-very-low'
    return intl.formatMessage({ id: 'warning-recharge-credit-very-low' }, { creditCount })
  } else if (status === 'LOW') {
    if (isSuperAdmin) return intl.formatMessage({ id: 'advice-recharge-credit-low' })
    return intl.formatMessage({ id: 'warning-recharge-credit-low' }, { creditCount })
  }

  return ''
}

const SmsAnalytics: FC<SmsAnalyticsProps> = ({ smsAnalytics: smsAnalyticsFragment }) => {
  const { totalCredits, consumedCredits, remainingCredits } = useFragment(FRAGMENT, smsAnalyticsFragment)
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const hasAlertMessage = remainingCredits.status === 'LOW' || remainingCredits.status === 'VERY_LOW'

  return (
    <Flex direction="row" spacing={4}>
      <CountSection variant={STATUS_COUNT[remainingCredits.status]}>
        <Flex direction="row" align="center" spacing={2}>
          <CountSection.Title>{intl.formatMessage({ id: 'remaining-credit' })}</CountSection.Title>
          {hasAlertMessage && (
            <Tooltip
              label={getAlertMessage(
                viewerSession.isSuperAdmin,
                remainingCredits.status,
                intl,
                remainingCredits.amount,
              )}
            >
              <Icon
                name={CapUIIcon.Cross}
                size={CapUIIconSize.Md}
                color={remainingCredits.status === 'LOW' ? 'yellow.500' : 'red.500'}
              />
            </Tooltip>
          )}
        </Flex>

        <CountSection.Count>{remainingCredits.amount}</CountSection.Count>
      </CountSection>

      <CountSection variant="blue">
        <CountSection.Title>{intl.formatMessage({ id: 'consumed-credit' })}</CountSection.Title>
        <CountSection.Count>{consumedCredits}</CountSection.Count>
      </CountSection>

      <CountSection variant="blue">
        <CountSection.Title>{intl.formatMessage({ id: 'total-bought' })}</CountSection.Title>
        <CountSection.Count>{totalCredits}</CountSection.Count>
      </CountSection>
    </Flex>
  )
}

export default SmsAnalytics
