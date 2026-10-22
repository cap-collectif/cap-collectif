import * as React from 'react'
import { useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import { Accordion, CapUIAccordionSize, Flex, FormLabel, Tag, Text } from '@cap-collectif/ui'
import { FieldInput, FormControl } from '@cap-collectif/form'
import type { EmailingCampaignStatus } from '@relay/EmailingCampaignItem_emailingCampaign.graphql'
import { DATE_TIME_FORMAT, getCampaignStatus } from '../utils'
import type { EmailingCampaignFormValues, SendingMode } from './EmailingCampaign.type'

type Props = {
  readonly disabled: boolean
  readonly status: EmailingCampaignStatus
  readonly sendAt: string | null
}

const EmailingCampaignSending: React.FC<Props> = ({ disabled, status, sendAt }) => {
  const intl = useIntl()
  const { control, watch } = useFormContext<EmailingCampaignFormValues>()
  const sendingMode = watch('sendingMode')
  const isPlanned = sendingMode?.labels?.[0] === 'PLANNED'
  const statusLabel = getCampaignStatus(status)

  const choices: Array<{ id: SendingMode; label: string; useIdAsValue: boolean; disabled: boolean }> = [
    { id: 'NOW', label: intl.formatMessage({ id: 'send-now' }), useIdAsValue: true, disabled },
    { id: 'PLANNED', label: intl.formatMessage({ id: 'global.plan' }), useIdAsValue: true, disabled },
  ]

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.md}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={['sending']}
      color="white"
    >
      <Accordion.Item id="sending">
        <Accordion.Button>{intl.formatMessage({ id: 'send-and-schedule' })}</Accordion.Button>
        <Accordion.Panel>
          <Flex direction="column" spacing={2} mb={4}>
            <Text fontWeight={600}>{intl.formatMessage({ id: 'global.status' })}</Text>
            <Tag variantColor={statusLabel.color} alignSelf="flex-start">
              {intl.formatMessage({ id: statusLabel.label })}
            </Tag>
            {status === 'PLANNED' && sendAt ? (
              <Text color="gray.700">
                {intl.formatMessage({ id: 'global.plannedDate' }, { date: intl.formatDate(sendAt, DATE_TIME_FORMAT) })}
              </Text>
            ) : null}
            {(status === 'SENT' || status === 'SENDING') && sendAt ? (
              <Text color="gray.700">
                {intl.formatMessage({ id: 'global.sentAt.date' }, { date: intl.formatDate(sendAt, DATE_TIME_FORMAT) })}
              </Text>
            ) : null}
          </Flex>

          {disabled ? null : (
            <>
              <FormControl name="sendingMode" control={control}>
                <FormLabel htmlFor="sendingMode" label={intl.formatMessage({ id: 'send-parameter' })} />
                <FieldInput type="radio" id="sendingMode" name="sendingMode" control={control} choices={choices} />
              </FormControl>

              {isPlanned ? (
                <FormControl name="sendAt" control={control} isRequired>
                  <FormLabel htmlFor="sendAt" label={intl.formatMessage({ id: 'sending-date' })} />
                  <FieldInput type="dateHour" id="sendAt" name="sendAt" control={control} />
                </FormControl>
              ) : null}
            </>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default EmailingCampaignSending
